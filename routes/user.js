const express=require('express');
const User = require('../models/User')
const bycrypt = require('bcryptjs')
const jwt=require('jsonwebtoken')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        console.error(error)
    }
})
// Fetching all the friends and their names
router.post('/friends', async (req, res) => {
    try {
        // Extract the user's ID from the request body
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: 'User ID is required' });
        }

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get the list of friends (assuming user has a `friends` field in their document)
        const friendIds = user.friends;

        if (!friendIds || friendIds.length === 0) {
            return res.status(200).json({ friends: [], msg: 'No friends found' });
        }

        // Find the friends by their IDs and retrieve only their names
        const friends = await User.find({ _id: { $in: friendIds } }, 'Name');

        // Send the list of friends' names in the response
        res.status(200).json({ friends });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/one', async (req, res) => {
    try {
        const { id } = req.body
        const users = await User.findOne({_id:id})
        res.json(users)
    } catch (error) {
        console.error(error)
    }
})


router.post('/register', async(req, res) => {
    try {
        console.log(req.body)
        const { Name, Email, Password } = req.body;
        if (!Name || !Email || !Password) {
            return res.status(400).json({ msg: "Please enter all fields" })
        }
        if (Password.length < 6) {
            return res.status(400).json({ msg: "Password should be  consist of 6 words" })
        }

        const isexist = await User.findOne({ Email })
        if (isexist) {
            return res.status(400).json({ msg: "User already exists" })
        }

        const newuser = new User({
            Name,
            Email,
            Password
        })
    bycrypt.genSalt(10,(_err,salt)=>{
        bycrypt.hash(newuser.Password,salt,async(err,hash)=>{
         if(err)throw err;
         newuser.Password=hash;
         const saveduser=await newuser.save();
          res.json({
            id:saveduser.id,
            name:saveduser.Name,
            email:saveduser.Email
          });
        });
    });


    } catch (error) {
      res.status(400).json({error:error.message})
    }
})


router.post('/login', async (req, res, _next) => {
    try {
        const { Email, Password } = req.body
        if (!Email || !Password) {
            res.status(400).send("Fill all fields")
        }
        else {
            const user = await User.findOne({ Email })
            if (!user) {
                res.status(400).send("User or password is wrong")
            }
            else {
                const validateuser = await bycrypt.compare(Password, user.Password)
                if (!validateuser) {
                    res.status(400).send("User or password is wrong")
                }
                else {
                    const payload = {
                        userId: user._id,
                        userEmail: user.Email
                    }
                    const jwtkey = 'this_is_a_secret_key_which_doesnt_need_to_be_exposed'
                    jwt.sign(payload, jwtkey, {
                        expiresIn: 84600
                    }, async (_err, token) => {
                        await User.updateOne({ _id: user.id, }, {
                            $set: { token }
                        })
                        user.save()
                        return res.status(200).json({ user: {id:user._id, name: user.Name, email: user.Email}, token: token })
                    })
                }
            }
        }

    } catch (error) {
        console.error(error)
    }
})

module.exports = router