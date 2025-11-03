#!/usr/bin/env python3

"""实现明星台球的服务器端"""

# 导入所需模块和函数
from datetime import datetime, timedelta, timezone
import sqlite3 as sq
import bcrypt
from flask import Flask, request, jsonify
from flask_cors import CORS

# 创建Web服务对象，同时支持跨域访问
app = Flask(__name__)
CORS(app)


def initialize_table():
    """创建数据库，建立表格"""
    with sq.connect("starball.db") as conn:
        cursor = conn.cursor()
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS user_info (user_id INTEGER PRIMARY KEY, user_name TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, coins INTEGER NOT NULL DEFAULT 0, picture TEXT NOT NULL, total_games INTEGER NOT NULL DEFAULT 0, win_games INTEGER NOT NULL DEFAULT 0, win_rate REAL NOT NULL DEFAULT -1, bar_number NOT NULL DEFAULT 1)"""
        )
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS bar_info (bar_id INTEGER PRIMARY KEY, price INTEGER NOT NULL)"""
        )
        conn.commit()


@app.route("/api/auth/register", methods=["POST"])
def register():
    """处理注册逻辑"""
    try:
        data = request.get_json()
        if not data:
            print("服务器端未能收到数据")
            return jsonify({"message": "Fail", "data": {}}), 400

        user_name = data.get("user_name")
        if not user_name:
            print("注册用户名不能为空")
            return jsonify({"message": "Fail", "data": {}}), 400

        with sq.connect("starball.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT user_name FROM user_info WHERE user_name = ?""", (user_name,)
            )
            res = cursor.fetchone()

            if res:
                print("用户名已被占用")
                return jsonify({"message": "Fail", "data": {}}), 409
            password = data.get("password")
            raw = password.encode("utf-8")
            password_hash = bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")
            cursor.execute(
                """INSERT INTO user_info (user_name, password_hash) VALUES (?, ?)""",
                (user_name, password_hash),
            )
            conn.commit()

            user_id = cursor.lastrowid
            print("用户注册成功")
            return (
                jsonify(
                    {"message": "Success", "data": {"user_id": user_id, "coins": 0}}
                ),
                200,
            )
    except Exception as e:
        print(f"注册业务出现异常:{e}")
        return jsonify({"message": "Fail", "data": {}}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """处理登录逻辑"""
    try:
        data = request.get_json()
        if not data:
            print("服务器端未能收到数据")
            return jsonify({"message": "Fail", "data": {}}), 400

        user_name = data.get("user_name")
        if not user_name:
            print("登录用户名不能为空")
            return jsonify({"message": "Fail", "data": {}}), 400

        with sq.connect("starball.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT user_id, password_hash, coins FROM user_info WHERE user_name = ?""",
                (user_name,),
            )
            res = cursor.fetchone()
            if not res:
                print("用户登录失败")
                return jsonify({"message": "Fail", "data": {}}), 400

            password = data.get("password")
            raw = password.encode("utf-8")
            if not bcrypt.checkpw(raw, res[1].encode("utf-8")):
                print("用户登录失败")
                return jsonify({"message": "Fail", "data": {}}), 400

            print("用户登录成功")
            return (
                jsonify(
                    {"message": "Success", "data": {"user_id": res[0], "coins": res[2]}}
                ),
                200,
            )
    except Exception as e:
        print(f"登录业务异常:{e}")
        return jsonify({"message": "Fail", "data": {}}), 500


@app.route("/api/auth/userinfo", methods=["GET"])
def get_user_info():
    """获取用户信息"""
    try:
        try:
            user_id = int(request.args.get("user_id"))
        except Exception as e:
            print(f"前端数据传递错误:{e}")
            return jsonify({"message": "Fail", "data": {}}), 400

        with sq.connect("starball.db") as conn:
            conn.row_factory = sq.Row
            cursor = conn.cursor()
            cursor.execute(
                """SELECT coins, bar_number, total_game, win_games, win_rate, picture FROM user_info WHERE user_id = ?""",
                (user_id,),
            )
            res = cursor.fetchone()

            if not res:
                print("用户不存在")
                return jsonify({"message": "Fail", "data": {}}), 404

            print("获取信息成功")
            return jsonify({"message": "Success", "data": dict(res)})
    except Exception as e:
        print(f"获取信息失败:{e}")
        return jsonify({"message": "Fail", "data": {}}), 500


@app.route("/api/auth/market", methods=["GET"])
def show_market():
    """展示商城信息"""
    user_id = request.args.get("user_id")
    if not user_id or not user_id.isdigit():
        print("前端数据传递错误")
        return jsonify({"message": "Fail", "data": {}}), 400
    user_id = int(user_id)

    try:
        with sq.connect("starball.db") as conn:
            conn.row_factory = sq.Row
            cur = conn.cursor()
            cur.execute(
                "SELECT bar_number FROM user_info WHERE user_id = ?", (user_id,)
            )
            res = cur.fetchone()
            if not res:
                print("用户不存在，非法的访问")
                return jsonify({"message": "Fail", "data": {}}), 404

            ball_number_dict = dict(res)
            cur.execute("SELECT * FROM bar_info")
            res = cur.fetchall()
            bar_dict = {str(row["id"]): row["price"] for row in res}
            print("商城信息获取成功")
            return (
                jsonify(
                    {
                        "message": "Success",
                        "data": ball_number_dict | {"bar_data": bar_dict},
                    }
                ),
                200,
            )
    except Exception as e:
        print(f"商城信息获取异常:{e}")
        return jsonify({"message": "服务器异常", "data": {}}), 500


@app.route("/api/auth/buy", methods=["POST"])
def buy_bar():
    """用户购买球杆"""
    data = request.get_json()
    if not data:
        print("前端传递空数据")
        return jsonify({"message": "Fail", "data": {}}), 400
    user_id, bar_id = int(data.get("user_id")), int(data.get("bar_id"))

    with sq.connect("starball.db") as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT coins, bar_number FROM user_info WHERE user_id = ?", (user_id,)
        )
        res = cur.fetchone()
        if not res:
            print("用户不存在")
            return jsonify({"message": "Fail"}), 400
        res_money = int(res[0])
        bar_number = int(res[1])
        cur.execute("SELECT price FROM bar_info WHERE bar_id = ?", (bar_id,))
        price = cur.fetchone()[0]
        if res_money >= price:
            res_money = res_money - price
            bar_number |= 2**bar_id
            cur.execute(
                "UPDATE user_info SET coins = ?, bar_number = ? WHERE user_id = ?",
                (res_money, bar_number, user_id),
            )
            conn.commit()
            print("球杆购买成功")
            return jsonify({"message": "Success"}), 200
        print("用户余额不够")
        return jsonify({"message": "Fail"}), 400
