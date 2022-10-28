const express = require('express');
const User = require('./user');
const auth = require('./auth')

require('./db/mongoose')
const app = express();

app.use(express.json())

app.set('view-engine', 'ejs')

app.get('/register', (req,res)=>{
    res.render('register.ejs')
})

app.get('/login', (req,res)=>{
    res.render('login.ejs')
})

app.post('/register', async (req,res)=>{
    
    const user = new User(req.body)
    
    try{
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user , token})
        
    }
    catch (e) {
        res.status(400).send(e)
    }    

})

app.post('/login', async (req, res) => {
    
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

app.get('/user',auth,async (req,res)=>{
    res.send(req.user)
   
})


app.patch('/update', async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','password','email']
    const isValidOperation =  updates.every((update)=>
     allowedUpdates.includes(update))

     if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'})
     }
             
   try{
       const user = await User.findById(req.params.id)
                 
       updates.forEach((update)=>user[update] = req.body[update])
       await user.save()

 

         if(!user){
             return res.status(404).send()
         }
      res.send(user)
   } 
   catch(e){
           res.status(400).send(e)
   }
})

app.delete('/user/:id',auth,async (req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)
    
        if(!user){
         return res.status(404).send()
        }

        res.send(user)
    }

    catch(e){
          res.status(500).send(e)
    }    
})



app.listen(3000,console.log('app listening in port 3000'))

