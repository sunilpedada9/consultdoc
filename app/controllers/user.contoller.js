const { request } = require('express');
const db=require('../models');
const Op=db.Sequelize.Op;
const bcrypt=require('bcryptjs');
const {
    check,
    validationResult,
    body
} = require('express-validator');
const jwt=require('jsonwebtoken');
const authConfig=require('../config/auth.config');
const pagination=require('../helpers/pagination.helper');
const userRole=require('../helpers/userType.helper');

const User=db.User;
const UserType=db.UserType;
const Patient=db.Patient;
const Practitioner=db.Practitioner;
const RefreshToken=db.RefreshToken;
const uuid=require('uuid');

//  To add user  
exports.createUser=async(req,res)=>{
    let errors=validationResult(req);
    console.log(errors.array())
    if(!errors.isEmpty()){
        //console.log("in ##")
        return res.status(400).json({errors:errors.array()})
    }

    let typeDetail= await UserType.findOne({
        where:{
            [Op.and]:[
                {name:req.body.user_type},
                {status_id:{[Op.ne]:'3'}}
            ]
        }
    }).then(vale=>{
        if(vale){
            return vale
        }
        return res.status(400).json({errors:'User type is not valid!'})
    })
    .catch(err=>{
        return res.status(500).json({errors:`Cant not create due to:${err.message}`})
    })

    //console.log("usertp",typeDetail)
    console.log(bcrypt.hashSync(req.body.password,8))
    let userData={
        first_name:req.body.first_name,
        last_name:req.body.last_name,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password,8),
        phone_number:req.body.phone_number,
        user_type:typeDetail._id,
        status_id:'3'
    }
    await User.create(userData)
    .then(async(user)=>{
        if(user && typeDetail.name.toLowerCase() == 'practitioner'){
            await Practitioner.create({
                user_id:user._id,
                full_name:req.body.full_name,
                category:req.body.category,
                status_id:'1'
            })
            .then(async(result)=>{
                if(result){
                    await User.update({status_id:'1'},{
                        where:{_id:result.user_id}
                    })
                    .then(up=>{
                        if(up){
                            return res.status(201).json({
                                message:'Successfully registered.'
                            })
                        }
                    })
                }
            })
        }
        else if(user,typeDetail.name.toLowerCase() == 'patient'){
            await Patient.create({
                full_name:req.body.full_name,
                details:req.body.details,
                user_id:user._id,
                status_id:'1'
            })
            .then(async(result)=>{
                console.log('patient',result)
                if(result){
                    await User.update({status_id:'1'},{where:{_id:result.user_id}})
                    return res.status(201).json({
                        message:'Successfully registered.'
                    })
                }
            })
        }
        else{
            await User.update({status_id:'1'},{where:{_id:user._id}})
            return res.status(201).json({message:'Successfully registered'})
        }
    })
    .catch(err=>{
        return res.status(500).json({message:`Can not register error : ${err}`});
    })
};


// Signin 
exports.signIn=async(req,res)=>{
    let errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    await User.findOne({where:{
        [Op.and]:[{
            email:req.body.email
        },{
            status_id:{
                [Op.ne]:'3'
            }
        }]}
    })
    .then(async(user)=>{
        //console.log('user',user)
        if(!user){
            return res.status(404).json({errors:'User is not exist!'})
        }
        let passCamp=bcrypt.compareSync(req.body.password,user.password)
        if(!passCamp){
            return res.status(401).json({message:'Invalid password!'})
        }
        let token=jwt.sign({id:user._id},authConfig.secret,{expiresIn:authConfig.jwtExpiration})
        let expire=new Date();
        console.log("@",expire.getTime())
        expire.setSeconds(expire.getSeconds() + authConfig.jwtRefreshExpiration);
        console.log("@",expire.getTime())

        let refreshToken= await RefreshToken.create({
            _token:uuid.v4(),
            user_id:user._id,
            expiryDate:expire.getTime()
        })
        console.log(refreshToken)
        return res.status(200).json({
                    email:user.email,
                    accessToken:token,
                    refreshToken:refreshToken._token
                })
    })
    .catch(err=>{
        return res.status(500).json({message:`can not sign in due to :${err}`})
    })
}

// Generate access token with refresh token
exports.refreshToken=async(req,res)=>{
    let errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    await RefreshToken.findOne({
        where:{
            _token:req.body.refreshToken
        }
    }).then(async(tokenDetail)=>{
        //console.log("@@",tokenDetail.expiryDate.getTime())
        if(!tokenDetail){
            return res.status(404).json({errors:'Token is not exist!'});
        }
        else if(new Date(tokenDetail.expiryDate).getTime() < new Date().getTime()){
            await RefreshToken.destroy({where:{
                id:tokenDetail.id
            }})
            return res.status(403).json({message:'Refresh token was expired, please login.'});
        }
        else{
            let token=jwt.sign({
                id:tokenDetail.user_id
            },
            authConfig.secret,
            {
                expiresIn:authConfig.jwtExpiration
            })
            return res.status(200).json({
                accessToken:token,
                refreshToken:tokenDetail._token
            })
        }

    })
    .catch(err=>{
        return res.status(500).json({errors:`Cant get token due to:${err}`})
    })
}

// Pagination
exports.userList=async(req,res)=>{
    let errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    let pageNo=req.query.page_no;
    let pageRows=req.query.per_page_rows;
    let{limit,offset}=await pagination(pageRows,pageNo);

    let sort_by= req.query.sort_by ? req.query.sort_by : 'id';
    let sort_type=req.query.sort_type ? req.query.sort_type : 'asc'; 
    
    let search='';
    if(req.query.email){
        search+=` AND email='${req.query.email}'`
    }
    if(req.query.phone_number){
        search+=` And phone_number='${req.query.phone_number}'`
    }
    if(req.query.first_name){
        search+=` AND first_name='${req.query.first_name}'`
    }

    let query=`SELECT email,first_name,last_name,phone_number FROM users where status_id != '3'${search} 
                ORDER BY ${sort_by} ${sort_type} LIMIT ${offset},${limit};`
    console.log(query)
    await db.sequelize.query(query,{
        type: db.sequelize.QueryTypes.SELECT
    }).then(async(users)=>{
        console.log(users)
        if(!users.length){
            return res.status(200).json({message:'Data not found!'})
        }
        return res.status(200).json(users);
    })
    .catch(err=>{
        return res.status(500).json({errors:` Cant users details due to : ${err}`});
    })


}

// Get user details
exports.userView=async(req,res)=>{
    let errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    let user_id=req.body.id ? req.body.id : req.userID;
    console.log("dd",req.body.id )

    await User.findOne({
        where:{
            [Op.and]:[
                {_id:user_id},
                {status_id:{
                    [Op.ne]:'3'
                }}
            ]
        }
    })
    .then(async(user)=>{
        console.log("##",user.user_type)
        let userType= await userRole(user.user_type);
        console.log("##")
        if(userType.name.toLowerCase() === 'practitioner'){
            console.log("at")
            await Practitioner.findOne({
                where:{
                    [Op.and]:[
                        {
                            user_id:user._id
                        },
                        {
                            status_id:{
                                [Op.ne]:'3'
                            }
                        }
                    ]
                }
            }).then(practo=>{
                console.log('@@',practo)
                if(!practo){
                    return res.status(404).json('Pratitioner does not exist!')
                }
                user.full_name=practo.full_name;
                user.category=practo.category;
            })
        }
        if(userType.name.toLowerCase() === 'patient'){
            await Patient.findOne({
                where:{
                    [Op.and]:[
                        {user_id:user._id},
                        {status_id:{
                            [Op.ne]:'3'
                        }}
                    ]
                }
            }).then(async(patient)=>{
                if(!patient){
                    return res.status(404).json('Patient does not exist!')
                }
                user.full_name=patient.full_name;
                user.details=patient.details;
            })
        }
        return res.status(200).json({...user.dataValues,password:null});
    })
    .catch(err=>{
        return res.status(500).json({
            errors:`Can not get user details due to : ${err}`
        })
    })
}

// Validation of fields
exports.validate=(method)=>{
    switch(method){
        case 'create':{
            return [
                check('first_name').notEmpty().withMessage('Please enter first name.'),
                check('last_name').notEmpty().withMessage('Please enter last name.'),
                check('email').not().isEmpty().withMessage('Please enter email.')
                .isEmail().withMessage('Provided email is invalid!')
                .custom((value,{req})=>{
                    return new Promise((resolve,reject)=>{
                        User.findOne({
                            where:{
                                [Op.and]:[
                                    {email:req.body.email},
                                    {status_id:{
                                        [Op.ne]:'3'
                                    }}
                                ]
                            }
                        })
                        .then(value=>{
                            if(value){
                                reject({errors:'This email already Exist!'})
                            };
                            resolve(true)
                        })
                        .catch(err=>{
                            reject(`Error :${err.message}`)
                        })
                    })
                }),
                check('phone_number').not().isEmpty().withMessage('Please enter phone number.')
                .custom((value,{req})=>{
                   return new Promise((reject,resolve)=>{
                    User.findOne({where:{
                        [Op.and]:[
                            {phone_number:req.body.phone_number},
                            {status_id:{[Op.ne]:'3'}}
                        ]
                    }})
                    .then(val=>{
                        if(val){
                            reject('Given phone numder already exist!')
                        }
                        resolve(trues)
                    })
                    .catch(err=>{
                        reject(`Error :${err.message}`)
                    })
                   })
                }),
                check('password').not().isEmpty().withMessage('Please provide password!'),
                check('user_type').not().isEmpty().withMessage('Please provide user type!')
                .custom((value,{req})=>{
                    return new Promise((resolve,reject)=>{
                        UserType.findOne({where:{
                            [Op.and]:[
                                {
                                  name:req.body.user_type  
                                },
                                {
                                    status_id:{
                                        [Op.ne]:'3'
                                    }
                                }
                            ]
                        }})
                        .then(val=>{
                            //console.log("@@",val)
                            if(!val){
                                reject('User type is not valid!');
                            }
                            resolve(true)
                        })
                        .catch(err=>{
                            reject(`Error : ${err.message}`);
                        })
                    })
                })
            ]
        }
    case 'signin':{
        return [check('email').notEmpty().isEmail().withMessage('Email is required!'),
                check('password').not().isEmpty().withMessage('Password is required!')]
    }
    case 'refreshToken':{
        return [check('refreshToken').notEmpty().withMessage('Token is required!')]
    }
    }
};