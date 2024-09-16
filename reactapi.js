const express = require('express');
const app = express();
const fs = require('fs')
const users = require('./db.json')
const tasks = require('./tasks.json')
const cors = require('cors');

app.use(cors())
app.use(express.json())

app.post('/login', (req, res)=>{
	/*	
	let body = ''
	req.on('data', chunk=>{
		body += chunk.toString()
	})
	req.on('end',()=>{
		const data = JSON.parse(body)
		data.timestamp = Date.now()
		const userFound = users.find(user => user.username === data.username && user.password === data.password)
		if(userFound){
        res.status(201).send("Welcome ", userFound.username)
		} else {res.status(500).send("No se pudo encontrar el usuario")}
	})*/
	data = req.body
	const userFound = users.find(user => user.userName === data.userName && user.password === data.password)
	console.log(userFound)
	if(userFound){
        res.status(201).json(userFound)
		} else {res.status(500).send("Usuario o contraseña incorrectos")}
})
app.post('/register', (req, res)=>{
	const newData = req.body
	console.log(newData)
	fs.readFile('db.json', 'utf-8', (err, data)=>{
		let oldData = []
		if(err){
			console.log("archivo no encontrado")
		} else{
			  try{
                 oldData = JSON.parse(data)
			} catch(error){
				console.log("error al parsear el JSON", error)
				return res.status(500).send("error al procesar los datos")
			}
		}
		const isUserExistent = oldData.find(user => user.userName === newData.userName)
		const isEmailExistent = oldData.find(email => email.email === newData.email)
    	if(!isUserExistent && !isEmailExistent){oldData.push(newData)} else {console.log("el email o el usuario ya esta registrado")}

    	fs.writeFile('db.json', JSON.stringify(oldData), (err)=>{
		console.log("sobreescrito correctamente");
	})
       	res.status(201).json(oldData)
	})

})
app.get('/tasks', (req, res)=>{
	let {letters} = req.query
     if(!letters){res.status(201).send(tasks)}
     	else{
     let tasksFound = tasks.filter(task => task.title.toLowerCase().startsWith(letters.toLowerCase()))
     if(tasksFound){res.status(200).send(tasksFound)} else {res.status(404).send("Tareas no encontradas")}
     	}
})
app.post('/tasks', (req, res) =>{
	var inputData = req.body

	fs.readFile('tasks.json', 'utf-8', (err, data)=>{
	let fileData = []

		if(err){console.log("failed to read the file")}else{
		    try{
		      fileData = JSON.parse(data)
		    } catch(error){return res.status(500).send(`Hubo un error de lectura ${error}`)}
	     }

          //Asignar una Id disponible al InputData y inyectarlo en el fileData
	   	for(let i = 0; i <= fileData.length; i++){
            let isUsed = fileData.findIndex(data => data.taskID == i)
            if(isUsed === -1) { inputData = {...inputData, taskID: i  }; break; }
	     };  fileData.push(inputData);

	     //fileData listo para ser usado
	     fs.writeFile('tasks.json', JSON.stringify(fileData), (err)=>{
		       if(err){console.log(err)}else{
		       	console.log("Datos sobreescritos correctamente")
     	          res.status(201).json(inputData)
		       }
	     })
	})
	
})
app.get('/userTasks', (req, res)=>{
	userID = req.headers.autorization
	ownTasks = tasks.filter(task => task.userID == userID)
     res.status(201).send(JSON.stringify(ownTasks))
})
app.delete('/tasks/:id',(req, res)=>{
	const {id} = req.params
	const taskIndex = tasks.findIndex(task => task.taskID === parseInt(id))
	var handledTasks = tasks

	if(taskIndex !== -1){
		handledTasks.splice(taskIndex,1)
		fs.writeFile('tasks.json', JSON.stringify(handledTasks), (err)=>{ if(err){ console.log(err) }});
		res.status(200).json({message:"Tarea eliminada correctamente"});
	} else {
		res.status(404).json({message:"Tarea no encontrada"})
	}
	
})
app.patch('/tasks/:id',(req, res)=>{
	const data = req.body
	const {id} = req.params
	const taskIndex = tasks.findIndex(task => task.taskID === parseInt(id))
	var handledTasks = tasks
     if(taskIndex !== -1){
		tasks[taskIndex] = {
               ...tasks[taskIndex],
               ...data
		}
		fs.writeFile('tasks.json', JSON.stringify(tasks), (err)=>{ if(err){ console.log(err) }});
		res.status(200).json({message:"Tarea actualizada correctamente"});
	} else {
		res.status(404).json({message:"Tarea no encontrada"})
	}
	res.status(200).json(data)

	
})

const PORT = process.env.PORT ?? 2020
app.listen(PORT,()=>{
	console.log(`Listening on: ${PORT}`)
})