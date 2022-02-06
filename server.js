require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const db=require('./app/models');

// Create app
const app=express();

// Add path
const corsOptions={
    allowHeaders: [],
    origin: [
        'http://localhost:8081',
        'http://localhost:8000'
    ]
}

// parse the request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set cors path
app.use(cors(corsOptions));

// Initiate database
db.sequelize.sync();        //development server keep force:true

// Sample route
app.get('/',(req,res)=>{
    res.status(200).json({message:'Welcome to the consultdoc API.'})
})

// Application routes
require('./app/routes')(app);

// To handel the invalide url
app.use('*',(req,res)=>{
    res.status(404).json({error:'The requested resources could not found in this API. Please refer the API documentation : '});
})

let PORT=process.env.SERVER_PORT;

// Create server
app.listen(PORT,()=>{
    console.log(`Server started at port number:${PORT}`)
    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        // application specific logging, throwing an error, or other logic here
      })
})
