#!/usr/bin/env python3

"""实现台球游戏的服务器端"""

# 导入所需模块
import sqlite3 as sq
import os
import logging
from logging.handlers import RotatingFileHandler
import bcrypt
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

# 创建Web实体，支持跨域访问，开启实时通信，记录通信对象
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
user_sockets = {}

# 创建日志文件夹，定义日志文件路径
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)
LOG_FILE = os.path.join(LOG_DIR, "starball.log")

# 创建Logger对象，并设置日志等级过滤，设置日志格式
logger = logging.getLogger("my_app")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
)

# 设置输出到控制台的日志：级别过滤、格式
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 设置输出到滚动文件的日志：大小、数量、级别过滤、格式
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


# 数据库初始化
def initialize_table():
    """创建数据库，建立表格"""
    with sq.connect("starball.db") as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        cur = conn.cursor()

        # 创建用户信息表
        cur.execute(
            """CREATE TABLE IF NOT EXISTS user_info (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            coins INTEGER NOT NULL DEFAULT 300,
            total_games INTEGER NOT NULL DEFAULT 0,
            win_games INTEGER NOT NULL DEFAULT 0,
            win_rate REAL NOT NULL DEFAULT -1,
            bar_possess INTEGER NOT NULL DEFAULT 1,
            picture TEXT NOT NULL DEFAULT "")"""
        )

        # 创建球杆信息表并初始化
        cur.execute(
            """CREATE TABLE IF NOT EXISTS bar_info (
            bar_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bar_name TEXT NOT NULL UNIQUE,
            price INTEGER NOT NULL)"""
        )
        cur.execute("SELECT COUNT(*) FROM bar_info")
        res = cur.fetchone()[0]
        if not res:
            bar_data = [
                ("极速球杆", 520),
                ("力量球杆", 880),
                ("精准球杆", 310),
                ("影刃球杆", 760),
                ("天命球杆", 450),
                ("雷霆球杆", 210),
                ("幻影球杆", 980),
                ("霸王球杆", 600),
            ]
            cur.executemany(
                "INSERT INTO bar_info (bar_name, price) VALUES (?, ?)", bar_data
            )

        # 创建对局信息表
        cur.execute(
            """CREATE TABLE IF NOT EXISTS room_info(
            room_id INTEGER PRIMARY KEY AUTOINCREMENT,
            player1_id INTEGER NOT NULL,
            player2_id INTEGER,
            state INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (player1_id) REFERENCES user_info(user_id),
            FOREIGN KEY (player2_id) REFERENCES user_info(user_id))"""
        )
        conn.commit()


# 用户注册
@app.route("/api/auth/register", methods=["POST"])
def register():
    """处理注册逻辑"""
    # 检查数据
    try:
        data = request.get_json()
        if not data:
            raise ValueError("客户端未传递数据")
        user_name = data.get("user_name")
        password_plain = data.get("password")
        if not user_name or not password_plain:
            raise ValueError("用户名或密码为空")
    except ValueError as reg_error:
        logger.warning("注册失败: %s", reg_error)
        return jsonify({"message": "fail", "data": {}, "error": "无效的请求"}), 400

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM user_info WHERE user_name = ?", (user_name,))
            if cur.fetchone():
                logger.info("用户名已被占用")
                return (
                    jsonify({"message": "fail", "data": {}, "error": "用户名已被占用"}),
                    409,
                )

            # 注册合法时执行加密，并插入表格
            raw = password_plain.encode("utf-8")
            password_hash = bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")
            cur.execute(
                """INSERT INTO user_info (user_name, password_hash) VALUES (?, ?)""",
                (user_name, password_hash),
            )
            conn.commit()
            user_id = cur.lastrowid
            logger.info("用户%s注册成功", user_name)
            return (
                jsonify({"message": "ok", "data": {"user_id": user_id, "coins": 300}}),
                201,
            )
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


# 登录功能接口
@app.route("/api/auth/login", methods=["POST"])
def login():
    """处理登录逻辑"""
    # 验证前端数据
    data = request.get_json()
    if not data:
        print("客户端传递空数据")
        return jsonify({"message": "Fail", "data": {}}), 400
    user_name = data.get("user_name")
    password = data.get("password")
    if not user_name or not password:
        print("客户端传递无效数据")
        return jsonify({"message": "Fail", "data": {}}), 400

    # 后端执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT user_id, password_hash, coins FROM user_info WHERE user_name = ?",
                (user_name,),
            )
            res = cur.fetchone()
            if not res or not bcrypt.checkpw(
                password.encode("utf-8"), res[1].encode("utf-8")
            ):
                print("登录失败")
                return jsonify({"message": "Fail", "data": {}}), 401

            print("用户登录成功")
            return (
                jsonify(
                    {"message": "Success", "data": {"user_id": res[0], "coins": res[2]}}
                ),
                200,
            )
    except Exception as login_error:
        print(f"登录服务异常:{login_error}")
        return jsonify({"message": "Fail", "data": {}}), 500


# 用户信息接口
@app.route("/api/auth/userinfo", methods=["GET"])
def get_user_info():
    """获取用户信息"""
    # 验证前端数据
    try:
        user_id = int(request.args.get("user_id"))
    except Exception as info_error:
        print(f"前端传递无效数据:{info_error}")
        return jsonify({"message": "Fail", "data": {}}), 400

    # 后端执行操作
    try:
        with sq.connect("starball.db") as conn:
            conn.row_factory = sq.Row
            cur = conn.cursor()
            cur.execute(
                "SELECT coins, bar_number, total_games, win_games, win_rate, picture "
                "FROM user_info WHERE user_id = ?",
                (user_id,),
            )
            res = cur.fetchone()
            if not res:
                print("获取信息失败")
                return jsonify({"message": "Fail", "data": {}}), 404
            print("获取信息成功")
            return jsonify({"message": "Success", "data": dict(res)}), 200
    except Exception as info_error:
        print(f"获取信息服务异常:{info_error}")
        return jsonify({"message": "Fail", "data": {}}), 500


# 商城信息接口
@app.route("/api/auth/market", methods=["GET"])
def show_market():
    """获取商城信息"""
    # 验证前端数据
    try:
        user_id = int(request.args.get("user_id"))
    except Exception as market_error:
        print(f"客户端传递无效数据:{market_error}")
        return jsonify({"message": "Fail", "data": {}}), 400

    # 执行后端操作
    try:
        with sq.connect("starball.db") as conn:
            conn.row_factory = sq.Row
            cur = conn.cursor()
            cur.execute(
                "SELECT bar_number FROM user_info WHERE user_id = ?", (user_id,)
            )
            res = cur.fetchone()
            if not res:
                print("获取商城信息失败")
                return jsonify({"message": "Fail", "data": {}}), 404
            bar_numdict = {"bar_number": res[0]}
            cur.execute("SELECT * FROM bar_info")
            res = cur.fetchall()
            items = [dict(r) for r in res]
            bar_dict = {"bar_data": items}
            print("获取商城信息成功")
            return jsonify({"message": "Success", "data": bar_numdict | bar_dict}), 200
    except Exception as market_error:
        print(f"获取商城信息服务异常:{market_error}")
        return jsonify({"message": "Fail", "data": {}}), 500


# 购买球杆接口
@app.route("/api/auth/buy", methods=["POST"])
def bar_buy():
    """购买球杆"""
    # 验证前端数据
    data = request.get_json()
    if not data:
        print("前端传递空数据")
        return jsonify({"message": "Fail", "data": {}}), 400
    try:
        user_id = int(data.get("user_id"))
        bar_id = int(data.get("bar_id"))
    except Exception as buy_error:
        print(f"客户端传递无效数据:{buy_error}")
        return jsonify({"message": "Fail", "data": {}}), 400

    # 后端执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT coins, bar_number FROM user_info WHERE user_id = ?", (user_id,)
            )
            res = cur.fetchone()
            if not res:
                print("购买失败")
                return jsonify({"message": "Fail", "data": {}}), 404
            coins = res[0]
            bar_number = res[1]
            if bar_number & (1 << (bar_id - 1)):
                print("不能重复购买")
                return jsonify({"message": "Fail", "data": {}}), 409
            cur.execute("SELECT price FROM bar_info WHERE bar_id = ?", (bar_id,))
            res = cur.fetchone()
            if not res:
                print("购买失败")
                return jsonify({"message": "Fail", "data": {}}), 404
            price = res[0]

            if coins >= price:
                coins = coins - price
                bar_number = bar_number | (1 << (bar_id - 1))
                cur.execute(
                    "UPDATE user_info SET coins = ?, bar_number = ? WHERE user_id = ?",
                    (coins, bar_number, user_id),
                )
                conn.commit()
                print("购买成功")
                return (
                    jsonify(
                        {
                            "message": "Success",
                            "data": {"coins": coins, "bar_number": bar_number},
                        }
                    ),
                    200,
                )
            print("购买失败")
            return jsonify({"message": "Fail", "data": {}}), 400
    except Exception as buy_error:
        print(f"购买出错:{buy_error}")
        return jsonify({"message": "Fail", "data": {}}), 500


# 用户创建房间
@socketio.on("create_room")
def create(data):
    """用户创建房间"""
    if not data:
        print("前端传递空数据")
        emit("Fail", {"detail": "空数据", "room_id": None})
        return
    try:
        user_id = int(data.get("user_id"))
    except Exception as create_error:
        print(f"前端传递无效数据:{create_error}")
        emit("Fail", {"detail": "无效数据", "room_id": None})
        return

    # 后端执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                """SELECT room_id FROM room_info WHERE (player1_id = ? OR player2_id = ?) AND state <> 2""",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if res:
                print("房间创建失败")
                emit("Fail", {"detail": "玩家已在房间中", "room_id": None})
                return
            cur.execute("""INSERT INTO room_info (player1_id) VALUES (?)""", (user_id,))
            conn.commit()
            room_id = cur.lastrowid
            old_sid = user_sockets.get(user_id)
            if old_sid:
                user_sockets.pop(user_id, None)
            user_sockets[user_id] = request.sid
            join_room(str(room_id))
            print("房间创建成功")
            emit("Success", {"detail": "创建成功", "room_id": room_id})
            return
    except Exception as create_error:
        print(f"创建房间失败:{create_error}")
        emit("Fail", {"detail": "服务器错误", "room_id": None})
        return


# 用户进入房间
@socketio.on("join_room")
def join(data):
    """用户进入房间"""
    if not data:
        print("前端传递空数据")
        emit("Fail", {"detail": "空数据"})
        return
    try:
        user_id = int(data.get("user_id"))
        room_id = int(data.get("room_id"))
    except Exception as create_error:
        print(f"前端传递无效数据:{create_error}")
        emit("Fail", {"detail": "无效数据"})
        return

    # 执行后端操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT player2_id FROM room_info WHERE room_id = ?", (room_id,)
            )
            res = cur.fetchone()
            if not res or res[0]:
                print("房间进入失败")
                emit("Fail", {"detail": "房间不存在或已满员"})
                return
            cur.execute("SELECT 1 FROM user_info WHERE user_id = ?", (user_id,))
            res = cur.fetchone()
            if not res:
                print("房间进入失败")
                emit("Fail", {"detail": "用户不合法"})
                return
            cur.execute(
                "UPDATE room_info SET player2_id = ?, state = ? WHERE room_id = ?",
                (user_id, 1, room_id),
            )
            conn.commit()
            join_room(room_id)
            print("进入房间成功")
            emit(
                "player_joined", {"user_id": user_id}, room=room_id, include_self=False
            )
            old_sid = user_sockets.get(user_id)
            if old_sid:
                user_sockets.pop(user_id, None)
            user_sockets[user_id] = request.sid
            emit("Success", {"detail": "加入成功"})
            return
    except Exception as join_error:
        print("进入房间服务异常")
        emit("Fail", {"detail": "进入房间服务异常"})
        return


# 用户击球
@socketio.on("strike")
def strike(data):
    """传递用户击球数据"""
    if not data:
        print("传递空数据")
        emit("Fail", {"detail": "前端传递数据为空"})
        return
    try:
        user_id = int(data.get("user_id"))
        angle = float(data.get("angle"))
        power = float(data.get("power"))
        if angle < 0 or power < 0:
            raise Exception("无效数据")
    except Exception as strike_error:
        print(f"传递无效数据:{strike_error}")
        emit("Fail", {"detail": "前端传递数据无效"})
        return

    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT player1_id, player2_id FROM room_info WHERE (player1_id = ? OR player2_id = ?) AND state = 1",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if not res:
                emit("Fail", {"detail": "用户不存在"})
                print("失败")
                return
            if not res[0]:
                emit("Fail", {"detail": "对局尚未开始"})
                print("失败")
                return
            if res[0] == user_id:
                target = res[1]
            else:
                target = res[0]
            print("发送成功")
            emit(
                "Hit ball",
                {"detail": "对方击球", "angle": angle, "power": power},
                to=user_sockets[target],
            )
            return
    except Exception as hit_error:
        print(f"传递数据错误:{hit_error}")
        return


# 击球玩家发送计算结果
@socketio.on("pos")
def check(data):
    """传递计算结果"""
    if not data:
        print("传递空数据")
        emit("Fail", {"detail": "前端传递数据为空"})
        return
    try:
        user_id = int(data.get("user_id"))
        ball_pos = data.get("balls")
        if not ball_pos:
            raise Exception("错误")
    except Exception as strike_error:
        print(f"传递无效数据:{strike_error}")
        emit("Fail", {"detail": "前端传递数据无效"})
        return
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT player1_id, player2_id FROM room_info WHERE (player1_id = ? OR player2_id = ?) AND state = 1",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if not res:
                emit("Fail", {"detail": "用户不存在"})
                print("失败")
                return
            if not res[0]:
                emit("Fail", {"detail": "对局尚未开始"})
                print("失败")
                return
            if res[0] == user_id:
                target = res[1]
            else:
                target = res[0]
            print("发送成功")
            emit(
                "pos",
                {"detail": "计算结果", "ball_pos": ball_pos},
                to=user_sockets[target],
            )
            return
    except Exception as hit_error:
        print(f"传递数据错误:{hit_error}")
        return


# 确认下一次击球开始
@socketio.on("next_hit")
def next_hit(data):
    """下一次击球"""
    if not data:
        print("传递空数据")
        emit("Fail", {"detail": "前端传递数据为空"})
        return
    try:
        user_id = int(data.get("user_id"))
    except Exception as strike_error:
        print(f"传递无效数据:{strike_error}")
        emit("Fail", {"detail": "前端传递数据无效"})
        return

    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT room_id FROM room_info WHERE (player1_id = ? OR player2_id = ?) AND state = 1",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if not res:
                print("无房间")
                return
            room_id = res[0]
            print("数据发送成功")
            emit(f"{user_id}hit", {"detail": "交换球权"}, room=room_id)
    except Exception as e:
        return


if __name__ == "__main__":
    initialize_table()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
