const router= require('express').Router();
const { Router } = require('express');
const controller=require('../controllers/user.contoller');
const {authJWT}=require('../middleware');

module.exports=(app)=>{
    // Register user
    router.post('/signup',controller.validate('create'),controller.createUser);
    router.post('/signin',controller.validate('signin'),controller.signIn);
    router.post('/refreshToken',controller.validate('refreshToken'),controller.refreshToken);
    router.get('/users-list',authJWT.verifyToken,controller.userList);
    router.get('/user-view',authJWT.verifyToken,controller.userView);

    app.use(process.env.ROUTER_PATH+'/user',router);
}
