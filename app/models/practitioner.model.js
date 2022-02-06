
module.exports=(sequelize,Sequelize)=>{
    const Practitioner= sequelize.define('practitioners',{
        _id:{
            type:Sequelize.UUID,
            unique:true,
            defaultValue:Sequelize.UUIDV4
        },
        full_name:{
            type:Sequelize.STRING(100),
            allowNull:false,
            require:true
        },
        category:{
            type:Sequelize.STRING(100),
            allowNull:false,
            require:true
        },
        user_id:{
            type:Sequelize.UUID,
            require:true
        },
       status_id:{
           type:Sequelize.ENUM('0','1','3'),
           defaultValue:'1'
       }
    },{
        timestamps:true
    })
    return Practitioner;
}