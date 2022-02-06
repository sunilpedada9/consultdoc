const {UserType}=require('./userType.model');
module.exports=(sequelize,Sequelize)=>{
    const User=sequelize.define('users',{
        _id:{
            type:Sequelize.UUID,
            unique:true,
            defaultValue:Sequelize.UUIDV4
        },
        first_name:{
            type:Sequelize.STRING(100)
        },
        last_name:{
            type:Sequelize.STRING(100)
        },
        email:{
            type:Sequelize.STRING(100),
            require:true,
            allwoNull:false
        },
        password:{
            type:Sequelize.STRING(100),
            require:true
        },
        phone_number:{
            type:Sequelize.INTEGER,
            require:true,
            allwoNull:false
        },
        user_type:{
            type:Sequelize.UUID,
            require:true
        },
        status_id:{
            type:Sequelize.ENUM('0','1','3'),
            allowNull:false,
            defaultValue:'1'
        }
    },
    {
        timestamps:true
    });

    return User;
};