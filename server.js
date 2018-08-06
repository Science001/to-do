const express = require('express')
const bodyParser = require('body-parser')
const { Pool } = require('pg')
const app = express()
const crypto = require('crypto')
const session = require('express-session')

const PORT = process.env.PORT || 5000
const baseURL = process.env.BASEURL

app.set('views', './views')
app.set('view engine', 'pug')
app.use(bodyParser.json())
app.use(session({
    secret: 'thereisatreasureunderatreeinthewoodswheresecretsaredeep',
    cookie: { maxAge: 1000*60*60*24*30 },
    resave: true,
    saveUninitialized: false
}))
app.use(express.static('resources'))


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

app.get('/', (req, res)=>{
    if(req.session && req.session.auth && req.session.auth.id) {
        pool.query('select open, done from master where id=$1', [req.session.auth.id], (err, results)=>{
            if(err) next(err)
            else {
                res.render('index', {open: results.rows[0].open, done: results.rows[0].done, username: req.session.auth.username})
            }
        })
    }
    else {
        res.redirect(baseURL+'/login')
    }
})

app.get('/logout', function(req,res) {
    delete req.session.auth;
    setTimeout(function(){
        res.redirect(baseURL+'/login')
    }, 1000)
 });

function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pdkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/login', (req, res) => {
    if(req.session && req.session.auth && req.session.auth.id) {
        res.redirect(baseURL)
    }
    else res.render('auth', {type: 'login', baseURL: baseURL})
})

app.post('/login', (req, res) => {
    var {username, password} = req.body
    res.setHeader('Content-Type','application/json');
    pool.query('SELECT id, username, password FROM master where username = $1', [username], (err, results)=>{
        if(err) {
            console.log(err.toString())
            res.status(500).send(JSON.parse('{ "message" : "Something\'s Wrong", "subtext" : "Try again later"}'))
        }
        else {
            if(results.rows.length===0) {
                res.status(403).send(JSON.parse('{ "message" : "Nah, not you", "subtext" : "Wrong Credentials. Try again!" }'))
            }
            else {
                var actualhashed = results.rows[0].password;
                var salt = actualhashed.split('$')[2];
                var givenHashed = hash(password, salt);
                if(actualhashed === givenHashed) {
                    req.session.auth = {
                        id: results.rows[0].id,
                        username: results.rows[0].username
                    }
                    res.status(200).send(JSON.parse('{ "message" : "Welcome!", "subtext" : "Loading your to-dos" }'))
                }
                else {
                    res.status(403).send(JSON.parse('{ "message" : "Nah, not you", "subtext" : "Wrong Credentials. Try again!" }'))
                }
            }
        }
    })
})

app.get('/signup', (req, res) => {
    if(req.session && req.session.auth && req.session.auth.id) {
        res.redirect(baseURL);
    }
    else res.render('auth', {type: 'signup', baseURL: baseURL})
})

app.post('/signup', (req, res) => {
    var {username, password} = req.body
    res.setHeader('Content-Type','application/json');
    pool.query('SELECT username FROM master where username=$1', [username], (err, results)=>{
        if(results.rows.length===0) {
            var salt = crypto.randomBytes(128).toString('hex')
            var hashed = hash(password, salt)
            var empty = []
            pool.query('INSERT INTO master (username, password, open, done) VALUES ($1, $2, $3, $4)', [username, hashed, empty, empty], (err, results)=>{
                if(err) {
                    console.log(err.toString())
                    res.status(500).send(JSON.parse('{ "message" : "Something\'s Wrong", "subtext" : "Try again later"}'))
                }
                else res.status(200).send(JSON.parse('{ "message" : "Signed Up!", "subtext" : "You will be redirected to Log In" }'))
            })
        }
        else res.status(400).send(JSON.parse('{ "message" : "Oh, that\'s taken!", "subtext" : "Try a different username" }'))
    })
})

app.post('/update', (req, res, next)=>{
    var {open, done} = req.body;
    pool.query('update master set open=$1, done=$2 where id=$3', [open, done, req.session.auth.id], (err, results)=>{
        if(err) next(err)
        else res.status(200).send('Done')
    })
})

app.listen(PORT, (req, res)=>{
    console.log(`Running in port ${PORT}`)
})