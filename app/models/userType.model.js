module.exports=(sequelize,Sequelize)=>{
    const UserType=sequelize.define('user_type',{
        _id:{
            type:Sequelize.UUID,
            unique:true,
            defaultValue:Sequelize.UUIDV4
        },
        name:{
            type:Sequelize.STRING(100),
            unique:true,
            allowNull:false,
            require:true
        },
        status_id:{
            type:Sequelize.ENUM('0','1','3'),
            defaultValue:'1'
        }
    },
    {
        timestamps:true
    })
    return UserType;
}