const jwt = require('jsonwebtoken')
const setting = require('../token.config')
const verify = {
    setToken(email, _id) {
        return new Promise((resolve, reject) => {
            let token = jwt.sign({
                    email,
                    _id
                },
                //秘钥
                setting.token.signKey, {
                    //过期时间
                    expiresIn: setting.token.signTime
                }
            )
            resolve(token)
        })
    },
    getToken(token){
        return new Promise((resolve,reject)=>{
            if(!token.split('').length){
                reject({
                    error:'the token is impty'
                    
                })
            }else{
                let data = jwt.verify(token.split(' ')[1],setting.token.signKey)
                resolve(data)
            }
        })
    }
}
module.exports = verify