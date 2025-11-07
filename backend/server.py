#!/usr/bin/env python3

"""实现台球游戏的服务器端"""

# 导入所需模块
import sqlite3 as sq
import bcrypt
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

# 创建Web服务对象，并支持跨域访问, 实时通信
user_sockets = {}
app = Flask(__name__)
socketio = SocketIO(app)
CORS(app)


# 数据库初始化
def initialize_table():
    """创建数据库，建立表格"""
    with sq.connect("starball.db") as conn:
        cur = conn.cursor()
        cur.execute(
            """CREATE TABLE IF NOT EXISTS user_info (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            coins INTEGER NOT NULL DEFAULT 0,
            total_games INTEGER NOT NULL DEFAULT 0,
            win_games INTEGER NOT NULL DEFAULT 0,
            win_rate REAL NOT NULL DEFAULT -1,
            bar_possess INTEGER NOT NULL DEFAULT 1,
            picture TEXT NOT NULL DEFAULT "")"""
        )
        # 残留1：头像字段存储问题
        cur.execute(
            """CREATE TABLE IF NOT EXISTS bar_info (
            bar_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bar_name TEXT NOT NULL UNIQUE,
            price INTEGER NOT NULL)"""
        )
        # 残留2：球杆价格问题
        cur.execute(
            """CREATE TABLE IF NOT EXISTS room_info(
            room_id INTEGER PRIMARY KEY AUTOINCREMENT,
            player1_id INTEGER NOT NULL,
            player2_id INTEGER,
            state INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (player1_id) REFERENCES user_info(user_id),
    FOREIGN KEY (player2_id) REFERENCES user_info(user_id)"""
        )
        conn.commit()


# 注册功能接口
@app.route("/api/auth/register", methods=["POST"])
def register():
    """处理注册逻辑"""
    # 验证前端数据
    data = request.get_json()
    if not data:
        print("客户端传递空数据")
        return jsonify({"message": "Fail", "data": {}}), 400
    user_name = data.get("user_name")
    password_plain = data.get("password")
    if not user_name or not password_plain:
        print("客户端传递无效数据")
        return jsonify({"message": "Fail", "data": {}}), 400

    # 后端执行操作
    try:
        with sq.connect("starball.db") as conn:
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM user_info WHRER user_name = ?", (user_name,))
            if cur.fetchone():
                print("用户名已被占用")
                return jsonify({"message": "Fail", "data": {}}), 409

            raw = password_plain.encode("utf-8")
            password_hash = bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")
            cur.execute(
                """INSERT INTO user_info (user_name, password_hash) VALUES (?, ?)""",
                (user_name, password_hash),
            )
            conn.commit()
            user_id = cur.lastrowid
            print("注册成功")
            return (
                jsonify(
                    {"message": "Success", "data": {"user_id": user_id, "coins": 0}}
                ),
                201,
            )
    except Exception as register_error:
        print(f"注册服务异常:{register_error}")
        return jsonify({"message": "Fail", "data": {}}), 500


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
