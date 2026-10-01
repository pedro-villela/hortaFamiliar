// Rotas de insumos,

const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, texto, opcao, numeroNaoNegativo, idDaRota } = require('../utils/validacao');

const router = express.Router();
router.use(autenticar);


// GET /api/insumos
router.get('/', async (req, res) => {

});

// GET /api/insumos/:id
router.get('/:id', async (req, res) => {

});

// POST /api/insumos — ***somente ADMIN***
router.post('/', autorizar('ADMIN'), async (req, res) => {

});

// PUT /api/insumos/:id — ***somente ADMIN***
router.put('/:id', autorizar('ADMIN'), async (req, res) => {

});

// DELETE /api/insumos/:id — ***somente ADMIN***
router.delete('/:id', autorizar('ADMIN'), async (req, res) => {

});

module.exports = router;