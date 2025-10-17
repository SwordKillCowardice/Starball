#!/usr/bin/env python3
"""
这是明星台球的后端代码
Version 0.0.1
"""


# 模块导入
from datetime import datetime, timedelta, timezone  # 时间
import sqlite3 as sq  # 数据库
import bcrypt  # 加密
from flask import Flask, request, jsonify  # 处理网络请求
from flask_cors import CORS  # 支持跨域访问

# 创建服务器实例，并支持跨域访问
app = Flask(__name__)
CORS(app)


def initialize_table():
    """数据库初始化"""
    with sq.connect("starball.db") as con:
        cursor = con.cursor()
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS user_info (userid INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, picture TEXT, total_games INTEGER DEFAULT 0,
            win_games INTEGER DEFAULT 0)"""
        )
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS gamePlayer (gameid INTEGER PRIMARY KEY AUTOINCREMENT, FOREIGN KEY player1_id               REFERENCES user_info(userid), FROEIGN KEY player2_id REFERNECES user_info(userid), state TEXT"""
        )
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS ball_info (ballid INTEGER PRIMARY KEY AUTOINCREMENT, FOREIGN KEY gameid 
            INTERGER REFERENCES game_info(gameid),  ballnumber INTEGER NOT NULL, solid INTEGER, color TEXT NOT NULL, 
            pos_x REAL NOT NULL, pos_y REAL NOT NULL, is_pocketed INTEGER NOT NULL"""
        )
        con.commit()


# 接口撰写
@app.route("/api/register", methods=["POST"])
def register():
    """注册接口"""
    try:
        # 解析前端数据
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # 前端数据为空
        if not username or not password:
            print("前端传递空数据")
            return jsonify({"state": "Fail", "message": "空数据", "userid": -1})

        # 不为空时，查询数据库进行信息比对
        with sq.connect("starball.db") as con:
            cursor = con.cursor()
            cursor.execute(
                "SELECT username FROM user_info WHERE username = ?", (username,)
            )
            result = cursor.fetchone()

            # 用户名空闲，执行注册, 密码加密存储
            if not result:
                password_hash = bcrypt.hashpw(
                    password.encode("utf-8"), bcrypt.gensalt()
                ).decode("utf-8")
                cursor.execute(
                    "INSERT INTO user_info (username, password_hash) VALUES (?, ?)",
                    (username, password_hash),
                )
                con.commmit()
                uid = cursor.lastrowid
                print(f"{username} 注册成功")
                return jsonify(
                    {"state": "Success", "message": "注册成功", "userid": uid}
                )

            # 用户名被占用
            print(f"{username} 已被占用")
            return jsonify({"state": "Fail", "message": "用户名已被占用", "userid": -1})

    except Exception as abnormal:
        print(f"系统异常：{abnormal}")
        return jsonify({"state": "Fail", "message": "系统异常", "userid": -1})


@app.route("/api/login", methods=["POST"])
def login():
    """登录接口"""
    try:
        # 解析前端数据
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # 前端数据为空
        if not username or not password:
            print("前端传递空数据")
            return jsonify({"state": "Fail", "message": "空数据", "userid": -1})

        # 查询用户名是否存在
        with sq.connect("starball.db") as con:
            cursor = con.cursor()
            cursor.execute("SELECT * FROM user_info WHERE username = ?", (username,))
            res = cursor.fetchone()

            # 如果用户名不存在
            if not res:
                print("用户名不存在，登录失败")
                return jsonify(
                    {"state": "Fail", "message": "不存在的用户名", "userid": -1}
                )

            # 用户名存在时，比对密码
            password_hash = res[2]
            if not bcrypt.checkpw(
                password.encode("utf-8"), password_hash.encode("utf-8")
            ):
                print("密码错误，登录失败")
                return jsonify({"state": "Fail", "message": "错误的密码", "userid": -1})

            # 密码正确
            print("用户登录成功")
            return jsonify(
                {"state": "Success", "message": "登陆成功", "userid": res[0]}
            )

    except Exception as regerror:
        print(f"系统异常：{regerror}")
        return jsonify({"state": "Fail", "message": "系统异常", "userid": -1})


@app.route("/api/get_userinfo", methods=["GET"])
def get_userinfo():
    """获取用户信息"""
    try:
        userid = request.args.get("userid")
        with sq.connect("starball.db") as con:
            cursor = con.cursor()
            cursor.execute("SELECT * FROM user_info WHERE userid = ?", (userid,))
            res = cursor.fetchone()

        print("用户信息获取成功")
        if not res[4]:
            win_rate = 0
        else:
            win_rate = res[5] / res[4]
        return jsonify(
            {
                "state": "Success",
                "message": "信息获取成功",
                "picture": res[3],
                "total_games": res[4],
                "win_games": res[5],
                "win_rate": win_rate,
            }
        )
    except Exception as infoerror:
        print("系统异常:{infoerror}")
        return jsonify(
            {
                "state": "Fail",
                "message": "信息获取失败",
                "picture": None,
                "total_games": None,
                "win_games": None,
                "win_rate": None,
            }
        )


# 初始化数据库，运行服务器，并允许任何可达网络访问
if __name__ == "__main__":
    initialize_table()
    app.run(host="0.0.0.0", post=5000)
