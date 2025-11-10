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
                jsonify(
                    {
                        "message": "ok",
                        "data": {"user_id": user_id, "coins": 300},
                        "error": "",
                    }
                ),
                201,
            )
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """处理登录逻辑"""
    # 检查数据
    try:
        data = request.get_json()
        if not data:
            raise ValueError("客户端未传递数据")
        user_name = data.get("user_name")
        password = data.get("password")
        if not user_name or not password:
            raise ValueError("用户名或密码为空")
    except ValueError as log_error:
        logger.warning("登录失败: %s", log_error)
        return jsonify({"message": "fail", "data": {}, "error": "无效的请求"}), 400

    # 执行操作
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
                logger.info("登陆失败")
                return (
                    jsonify(
                        {
                            "message": "fail",
                            "data": {},
                            "error": "用户名不存在或密码错误",
                        }
                    ),
                    401,
                )

            logger.info("登录成功")
            return (
                jsonify(
                    {
                        "message": "ok",
                        "data": {"user_id": res[0], "coins": res[2]},
                        "error": "",
                    }
                ),
                200,
            )
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@app.route("/api/user", methods=["GET"])
def get_user_info():
    """获取用户信息"""
    # 检查数据
    try:
        user_id = int(request.args.get("user_id"))
    except (TypeError, ValueError) as info_error:
        logger.warning("获取用户信息失败: %s", info_error)
        return jsonify({"message": "fail", "data": {}, "error": "无效的请求"}), 400

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            conn.row_factory = sq.Row
            cur = conn.cursor()
            cur.execute(
                "SELECT coins, bar_possess, total_games, win_games, win_rate, picture "
                "FROM user_info WHERE user_id = ?",
                (user_id,),
            )
            res = cur.fetchone()

            # 判定结果
            if not res:
                logger.warning("不存在的用户尝试获取信息: user_id=%s", user_id)
                return (
                    jsonify({"message": "fail", "data": {}, "error": "获取信息失败"}),
                    404,
                )

            logger.info("用户%s获取信息成功", user_id)
            return jsonify({"message": "ok", "data": dict(res), "error": ""}), 200
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@app.route("/api/bar/list", methods=["GET"])
def show_bar():
    """显示球杆信息"""
    # 检查数据
    try:
        user_id = int(request.args.get("user_id"))
    except (TypeError, ValueError) as info_error:
        logger.warning("获取球杆信息失败: %s", info_error)
        return jsonify({"message": "fail", "data": {}, "error": "无效的请求"}), 400

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            conn.row_factory = sq.Row
            cur = conn.cursor()
            cur.execute(
                "SELECT bar_possess FROM user_info WHERE user_id = ?", (user_id,)
            )
            res = cur.fetchone()
            if not res:
                logger.warning("不存在的用户尝试获取球杆信息: user_id=%s", user_id)
                return (
                    jsonify({"message": "fail", "data": {}, "error": "获取信息失败"}),
                    404,
                )
            bar_possess = res[0]

            cur.execute("SELECT * FROM bar_info ORDER BY bar_id")
            bars = cur.fetchall()
            if not bars:
                logger.error("商城初始化错误")
                return (
                    jsonify({"message": "fail", "data": {}, "error": "商城初始化错误"}),
                    500,
                )

            # 计算用户球杆资源情况
            possess, npossess = [], []
            for bar_row in bars:
                bar_row = dict(bar_row)
                bar_id = bar_row["bar_id"]
                if (1 << (bar_id - 1)) & bar_possess:
                    possess.append(bar_row)
                else:
                    npossess.append(bar_row)

            logger.info("获取球杆信息成功")
            return (
                jsonify(
                    {
                        "message": "ok",
                        "data": {"bar_possess": possess, "bar_npossess": npossess},
                        "error": "",
                    }
                ),
                200,
            )
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@app.route("/api/auth/buy", methods=["POST"])
def buy_bar():
    """用户购买球杆"""
    # 检查数据
    try:
        data = request.get_json()
        if not data:
            raise ValueError("客户端未传递数据")
        user_id = data.get("user_id")
        bar_id = data.get("bar_id")
        if not user_id or not bar_id:
            raise ValueError("用户id或球杆id为空")
    except ValueError as buy_error:
        logger.warning("购买失败: %s", buy_error)
        return jsonify({"message": "fail", "data": {}, "error": "无效的请求"}), 400

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            # 检查用户id合法性
            cur.execute(
                "SELECT coins, bar_possess FROM user_info WHERE user_id = ?", (user_id,)
            )
            res = cur.fetchone()
            if not res:
                logger.info("购买失败, 用户%s不存在", user_id)
                return (
                    jsonify({"message": "fail", "data": {}, "error": "用户不存在"}),
                    404,
                )
            coins = res[0]
            bar_possess = res[1]

            # 检查球杆id合法性
            cur.execute("SELECT price FROM bar_info WHERE bar_id = ?", (bar_id,))
            res = cur.fetchone()
            if not res:
                logger.info("购买失败, 无效的球杆id:%s", bar_id)
                return (
                    jsonify({"message": "fail", "data": {}, "error": "球杆不存在"}),
                    404,
                )
            price = res[0]

            # 检查购买操作合法性
            if bar_possess & (1 << (bar_id - 1)) or coins < price:
                logger.warning("已拥有当前球杆或余额不足")
                return (
                    jsonify(
                        {
                            "message": "fail",
                            "data": {},
                            "error": "已拥有当前球杆或余额不足",
                        }
                    ),
                    409,
                )

            # 购买成功
            coins = coins - price
            bar_possess = bar_possess | (1 << (bar_id - 1))
            cur.execute(
                "UPDATE user_info SET coins = ?, bar_possess = ? WHERE user_id = ?",
                (coins, bar_possess, user_id),
            )
            conn.commit()
            logger.info("购买成功")
            return (
                jsonify(
                    {
                        "message": "ok",
                        "data": {"coins": coins, "bar_possess": bar_possess},
                        "error": "",
                    }
                ),
                200,
            )
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@app.route("/api/room/create", methods=["POST"])
def create_room():
    """用户创建房间"""
    # 检查数据
    try:
        data = request.get_json()
        if not data:
            raise ValueError("客户端未传递数据")
        user_id = data.get("user_id")
        if not user_id:
            raise ValueError("用户id为空")
    except ValueError as crt_error:
        logger.warning("创建房间失败: %s", crt_error)
        return jsonify({"message": "fail", "data": {}, "error": "无效的请求"}), 400

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM user_info WHERE user_id = ?", (user_id,))
            res = cur.fetchone()
            if not res:
                logger.warning("不存在的用户%s试图创建房间", user_id)
                return (
                    jsonify({"message": "fail", "data": {}, "error": "无效的请求"}),
                    404,
                )

            cur.execute(
                """SELECT room_id FROM room_info WHERE (player1_id = ? OR player2_id = ?)
                AND state <> 2""",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if res:
                logger.info("房间创建失败")
                return (
                    jsonify(
                        {"message": "fail", "data": {}, "error": "用户有尚未退出的房间"}
                    ),
                    409,
                )

            cur.execute("""INSERT INTO room_info (player1_id) VALUES (?)""", (user_id,))
            conn.commit()
            room_id = cur.lastrowid
            logger.info("房间创建成功")
            return (
                jsonify({"message": "ok", "data": {"room_id": room_id}, "error": ""}),
                200,
            )
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@app.route("/api/room/join", methods=["POST"])
def join_later():
    """非创建者进入房间"""
    # 检查数据
    try:
        data = request.get_json()
        if not data:
            raise ValueError("客户端未传递数据")
        user_id = data.get("user_id")
        room_id = data.get("room_id")
        if not user_id or not room_id:
            raise ValueError("用户id或房间id为空")
    except ValueError as join_error:
        logger.warning("进入房间失败: %s", join_error)
        return jsonify({"message": "fail", "error": "无效的请求"}), 400

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM user_info WHERE user_id = ?", (user_id,))
            if not cur.fetchone():
                logger.warning("不存在的用户%s尝试进入房间", user_id)
                return jsonify({"message": "fail", "error": "无效的请求"}), 404
            cur.execute(
                "SELECT player2_id, state FROM room_info WHERE room_id = ?", (room_id,)
            )
            res = cur.fetchone()
            if not res or res[0] or res[1] != 0:
                logger.warning("房间不存在或者已满")
                return jsonify({"message": "fail", "error": "无效的请求"}), 404
            cur.execute(
                "UPDATE room_info SET player2_id = ?, state = 1 WHERE room_id = ?",
                (user_id, room_id),
            )
            conn.commit()
            logger.info("进入房间成功")
            return jsonify({"message": "ok", "error": ""}), 200
    except sq.Error:
        logger.exception("数据库服务异常")
        return jsonify({"message": "fail", "data": {}, "error": "数据库服务异常"}), 500


@socketio.on("join_room")
def handle_join_room(data):
    """用户进入房间，进行播报"""
    # 检查数据
    try:
        if not data:
            raise ValueError("客户端未传递数据")
        user_id = data.get("user_id")
        room_id = data.get("room_id")
        if not user_id or not room_id:
            raise ValueError("用户id或房间id为空")
    except ValueError as join_error:
        logger.warning("进入房间失败: %s", join_error)
        emit("fail", {"error": "无效的请求"})
        return

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                """SELECT room_id, player1_id, player2_id FROM room_info WHERE room_id = ? AND
                (player1_id = ? OR player2_id = ?) AND state <> 2""",
                (room_id, user_id, user_id),
            )
            res = cur.fetchone()
            if not res:
                logger.warning("用户不存在或者房间不存在")
                emit("fail", {"error": "无效的请求"})
                return
            player1, player2 = res[1], res[2]

            join_room(room_id)
            user_sockets[user_id] = request.sid
            if user_id == player1:
                logger.info("房间%s创建者%s加入房间", room_id, player1)
                emit("ok", {"room_id": room_id})
                return
            logger.info("玩家%s加入房间, 游戏正式开始", player2)
            emit(
                "game start",
                {"player1_id": player1, "player2_id": player2, "room_id": room_id},
                room=room_id,
            )
            return
    except sq.Error:
        logger.exception("数据库服务异常")
        emit("fail", {"error": "数据库服务异常"})
        return


@socketio.on("shoot")
def shoot(data):
    """用户击球"""
    # 检查数据
    try:
        if not data:
            raise ValueError("客户端未传递数据")
        user_id = data.get("user_id")
        angle = data.get("angle")
        power = data.get("power")
        if (
            not user_id
            or angle is None
            or power is None
            or not (0 <= angle <= 360 and 0 <= power <= 100)
        ):
            raise ValueError("无效的请求")
    except ValueError as shoot_error:
        logger.warning("传递击球数据失败: %s", shoot_error)
        emit("fail", {"error": "无效的请求"})
        return

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                """SELECT player1_id, player2_id FROM room_info WHERE
                (player1_id = ? OR player2_id = ?) AND state = 1""",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if not res:
                logger.warning("用户%s发出异常请求", user_id)
                emit("fail", {"error": "异常请求"})
                return
            if res[0] == user_id:
                target = res[1]
            else:
                target = res[0]
            logger.info("击球数据发送成功")
            emit(
                "opponent_hit",
                {"angle": angle, "power": power},
                to=user_sockets[target],
            )
            emit("shoot_success")
            return
    except sq.Error:
        logger.exception("数据库服务异常")
        emit("fail", {"error": "数据库服务异常"})
        return


@socketio.on("send_pos")
def send_pos(data):
    """传递击球方得到的球的位置"""
    # 检查数据
    try:
        if not data:
            raise ValueError("客户端未传递数据")
        user_id = data.get("user_id")
        balls = data.get("balls", [])
        error = False
        if not balls:
            raise ValueError("无效的请求")
        for ball in balls:
            ball_id = ball["ball_id"]
            # ball_posx = ball["ball_posx"]
            # ball_posy = ball["ball_posy"]
            # 球位置的检查等待和游戏模块沟通
            if not 0 <= ball_id <= 21:
                error = True
                break
        if not user_id or error:
            raise ValueError("无效的请求")
    except ValueError as pos_error:
        logger.warning("传递位置数据失败: %s", pos_error)
        emit("fail", {"error": "无效的请求"})
        return

    # 执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute(
                """SELECT player1_id, player2_id FROM room_info WHERE
                (player1_id = ? OR player2_id = ?) AND state = 1""",
                (user_id, user_id),
            )
            res = cur.fetchone()
            if not res:
                logger.warning("用户%s发出异常请求", user_id)
                emit("fail", {"error": "异常请求"})
                return
            if res[0] == user_id:
                target = res[1]
            else:
                target = res[0]
            logger.info("位置数据发送成功")
            emit(
                "opponent_pos",
                {"balls": balls},
                to=user_sockets[target],
            )
            emit("send_success")
            return
    except sq.Error:
        logger.exception("数据库服务异常")
        emit("fail", {"error": "数据库服务异常"})
        return


if __name__ == "__main__":
    initialize_table()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
