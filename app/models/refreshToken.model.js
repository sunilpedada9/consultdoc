module.exports=(sequelize,Sequelize)=>{
    const RefreshToken=sequelize.define('refreshtokens',{
        _token:{
            type:Sequelize.STRING(100),
            require:true
        },
        user_id:{
            type:Sequelize.UUID,
            require:true
        },
        expiryDate:{
            type:Sequelize.DATE,
            require:true
        }
    })

    return RefreshToken;
}