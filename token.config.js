//token配置
module.exports = {
    token: {
        //请求头
        header: 'authorization',
        // token密钥
        signKey: 'xunxiao_token_key_$$$$',
        //过期时间
        signTime: 3600 * 24 * 3,
        //不需要验证的路由
        unRoute: [{
            url: '/login', methods: ["GET"]
        },
        {
            url: '/register', methods: ["POST"]
        },
        ]
    }
}