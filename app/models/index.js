const Sequelize=require('sequelize');
const dbconfig=require('../config/db.config');

let db={};
let sequelize='';

const sequelize_host= new Sequelize(
    dbconfig.DB,
    dbconfig.USER,
    dbconfig.PASSWORD,
    {
        host:dbconfig.HOST,
        dialect:dbconfig.dialect,
        operatorsAliases:'0',
        dialectOptions:{
            dateStrings:true,
            typeCast:function(field,next){
                if(field.type === 'DATETIME' || field.type === 'DATETIME'){
                    return field.string()
                }
                return next()
            }
        },
        pool:dbconfig.pool
    })

if(dbconfig.HOST){
    sequelize=sequelize_host;
}

db.sequelize=sequelize;
db.Sequelize=Sequelize;
db.UserType=require('./userType.model')(sequelize,Sequelize);
db.User=require('./user.model')(sequelize,Sequelize);
db.Patient=require('./patient.model')(sequelize,Sequelize);
db.Practitioner=require('./practitioner.model')(sequelize,Sequelize);
db.RefreshToken=require('./refreshToken.model')(sequelize,Sequelize);

module.exports=db;