const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const {
  getAsync,
  setAsync
} = require('../redis/index.js')

let added_todos = 0
/* GET todos listing. */
router.get('/', async (_, res) => {

  const todos = await Todo.find({})
  res.send(todos);

});

/* receieve metadata for redis */
router.get('/statistics', async (_, res) => {

  const get_added_todos = await getAsync("added_todos")
  res.send(get_added_todos)

})

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })


  const added_todos = await getAsync("added_todos")
  const convert_added_todos = Number(added_todos) + 1
  await setAsync("added_todos", convert_added_todos)
  res.send({ ...todo, added_todos })

});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {


  const single_todo = await req.todo

  console.log('hello')
  res.send(single_todo)
  // res.sendStatus(200); // Implement this
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {

  const id = await req.params.id

  await Todo.updateOne({ id: id }, {
    text: req.body.text,
    done: req.body.done
  })
  res.sendStatus(200); // Implement this
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
