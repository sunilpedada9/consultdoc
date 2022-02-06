const router=require('express').Router();
const controller=require('../controllers/userType.controller');

module.exports=(app)=>{
    router.post('/createtype',controller.validate('create'),controller.createUserType);

    app.use(process.env.ROUTER_PATH+'/usertype',router);
}