const jwt=require('jsonwebtoken');
const config=require('../config/auth.config');
const db=require('../models');
const User=db.User;
const UserType=db.UserType;

exports.verifyToken=(req,res,next)=>{
    let token=req.headers['x-access-token']
    if(!token){
        return res.status(403).json({errors:'Token is required!'})
    }
    jwt.verify(token,config.secret,(err,decoded)=>{
        if(err){
            return res.status(401).json({errors:err})
        }
        req.userID=decoded.id;
        next();
    })
}

exports.isAdmin=(req,res,next)=>{
    User.findOne({where:{
        [Op.and]:[{
            _id:req.userID
        },
        {
            status_id:{
                [Op.ne]:'3'
            }
        }
    ]
    }})
    .then(async(user)=>{
        await UserType.findOne({
            where:{
               [Op.and]:[
                   {_id:user.user_type},
                   {status_is:{
                       [Op.ne]:'3'
                   }}
               ] 
            }
        })
        .then(async(usertype)=>{
            if(usertype.name.toLowerCase() === 'admin'){
                next();
                return;
            }
            else{
                return res.status(403).json({message:'Required admin role!'})
            }
        })

    })
    .catch(err=>{
        return res.status(500).json({error:`Can not found error : ${err}`})
    })
}

exports.isPractitioner=(req,res,next)=>{
    User.findOne({where:{
        [Op.and]:[{
            _id:req.userID
        },
        {
            status_id:{
                [Op.ne]:'3'
            }
        }
    ]
    }})
    .then(async(user)=>{
        await UserType.findOne({
            where:{
               [Op.and]:[
                   {_id:user.user_type},
                   {status_is:{
                       [Op.ne]:'3'
                   }}
               ] 
            }
        })
        .then(async(usertype)=>{
            if(usertype.name.toLowerCase() === 'practitioner'){
                next();
                return;
            }
            else{
                return res.status(403).json({message:'Required practitoner role!'})
            }
        })

    })
    .catch(err=>{
        return res.status(500).json({error:`Can not found error : ${err}`})
    })
}

exports.isPatient=(req,res,next)=>{
    User.findOne({where:{
        [Op.and]:[{
            _id:req.userID
        },
        {
            status_id:{
                [Op.ne]:'3'
            }
        }
    ]
    }})
    .then(async(user)=>{
        await UserType.findOne({
            where:{
               [Op.and]:[
                   {_id:user.user_type},
                   {status_is:{
                       [Op.ne]:'3'
                   }}
               ] 
            }
        })
        .then(async(usertype)=>{
            if(usertype.name.toLowerCase() === 'patient'){
                next();
                return;
            }
            else{
                return res.status(403).json({message:'Required patient role!'})
            }
        })

    })
    .catch(err=>{
        return res.status(500).json({error:`Can not found error : ${err}`})
    })
}