module.exports=(sequelize,Sequelize)=>{
    const Patient=sequelize.define('patients',{
        _id:{
            type:Sequelize.UUID,
            unique:true,
            defaultValue:Sequelize.UUIDV4
        },
        user_id:{
            type:Sequelize.UUID,
            require:true
        },
        full_name:{
            type:Sequelize.STRING(100),
            require:true,
            allowNull:false
        },
        details:{
            type:Sequelize.STRING(100),
            require:true,
            allowNull:false
        },
        status_id:{
            type:Sequelize.ENUM('0','1','3'),
            defaultValue:'1'
        }
    },{
        timestamps:true
    });

    return Patient;
}