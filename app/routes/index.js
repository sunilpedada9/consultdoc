const user=require('./user.routes');
const userType=require('./userType.routes');

module.exports=(app)=>{
    user(app);
    userType(app);
}