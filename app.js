//1 invocamos a express

const express = require('express');
const app = express();

//2 seteamos urlencode para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3  invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

// el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 motor de plantillas
app.set('view engine', 'ejs');

//6 invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//7 variables de sesion
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// 8 invocamos al moduo de conexion de la base de datos
const connection = require('./database/db');

//9 Estableciendo las rutas

app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/register', (req, res)=>{
    res.render('register');
})


// 10 Registo de ususario
app.post('/register', async (req, res)=>{
    const nombre = req.body.nombre;
    const email = req.body.email;
    const telefono = req.body.telefono;
    const contrasena = req.body.contrasena;
    let passwordHash = await bcryptjs.hash(contrasena, 8);
    connection.query('INSERT INTO user SET ?', {nombre:nombre, email:email, telefono:telefono, contrasena:passwordHash}, async(error, results)=>{
        if (error){
            console.log(error);
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            })
        }
    })
})

// 11 Autenticación

app.post('/auth', async (req, res)=>{
    const nombre = req.body.nombre;
    const contrasena = req.body.contrasena;
    let passwordHash = await bcryptjs.hash(contrasena, 8);
    if ( nombre && contrasena){
        connection.query('SELECT * FROM user WHERE nombre = ?', [nombre], async (error, results)=>{
            console.log(results)
            if(results.lenght == 0 || !(await bcryptjs.compare(contrasena, results[0].contrasena))){
                res.render('login',{
                    alert:true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o Contraseña Incorrectas",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.nombre = results[0].nombre
                res.render('login',{
                    alert:true,
                    alertTitle: "Conexión Exitosa",
                    alertMessage: "LOGIN CORRECTO",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
        })    
    }else{
        res.render('login',{
            alert:true,
            alertTitle: "Advertencia",
            alertMessage: "Porfavor Ingrese Usuario y/o Password",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
})

// 12 Autenticar paginas
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            nombre: req.session.nombre
        })
    }else{
        res.render('index',{
            login: false,
            nombre: 'Debe iniciar sesión' 
        })
    }
})

// 13 configuración del boton para salir de la sesion
app.get('/salir', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})
 
app.listen(3000, (req, res)=>{
    console.log('servidor corriendo en el http://localhost:3000');
}); 

//iniciar con nodemon app.js


