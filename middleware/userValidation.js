
const checkAuth = (req, res, next) => {

  const error = []
  if(!req.session.user){
    error.push('Session expired')
    return res.status(401).render('login', { error: error })
  }
  
  next()

}

module.exports = { checkAuth }