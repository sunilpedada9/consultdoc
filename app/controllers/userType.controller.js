const{
    check,
    validationResult
} = require('express-validator');
const db=require('../models');
const UserType=db.UserType;

exports.createUserType=async(req,res)=>{
    let errors=validationResult(req)
    if(!errors.array()){
        return res.status(400).json({errors:errors.array()})
    }

    await UserType.create({
        name:req.body.name
    })
    .then(async(val)=>{
        if(val){
            return res.status(201).json({message:'Successfully created.'})
        }
    })
    .catch(err=>{
        return res.status(500).json({errors:`can not create user type due to :${err.message}`})
    })
}

exports.validate=(method)=>{
    switch(method){
        case 'create':{
            return [
                check('name').notEmpty().withMessage('Please enter name!')
            ]
        }
    }
}