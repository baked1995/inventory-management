const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose')
const path = require("path")

const app = express();
const port = process.env.PORT || 4000;

const inventoryRoutes = require('./routes/inventory')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb+srv://Harshit:TtOb06CEYlxFQgHc@cluster0.6c9uk.mongodb.net/test?authSource=admin&replicaSet=atlas-n3x32g-shard-0&readPreference=primary&ssl=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', {} => {
    console.log('Mongoose is connected !!!!');
});

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static('client/build/'))

    app.get('/*', function(req, res) {
        res.sendFile(path.resolve(__dirname, 'client/build/'))
    })
}

// Connection URL
const uri = process.env.MONGODB_URI

// Initialize Connection Once and Create Connection Pool
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true},
    function(err) {
        if (err) throw err;
        console.log('Database Connected');
    })

// Routes that should handle requests
app.use('/inv', inventoryRoutes);

//step 3
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static('client/build'))
}

// Catch errors that go beyond the above routes
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

// Passes direct errors
app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

app.listen(port, function() {
    console.log("Server is running on Port: " + port)
})