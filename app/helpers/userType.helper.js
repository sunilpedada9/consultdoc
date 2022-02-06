const { Result } = require('express-validator');
const res = require('express/lib/response');
const db=require('../models');
const UserType=db.UserType;
const {Op}=db.Sequelize;

module.exports=(user_type)=>{
    return new Promise((resolver,reject)=>{
        UserType.findOne({where:{
            [Op.and]:[{
                _id:user_type
            },
        {
            status_id:{
                [Op.ne]:'3'
            }
        }]
        }})
        .then(details=>{
            if(details){
                resolver(details)
            }
            reject('Can not found!')
        })
        .catch(err=>{
            reject(err)
        })
    })
}