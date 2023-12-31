require('dotenv').config();

const logger = require('morgan');
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')


const app = express()
const path = require('path')
const port = 3000

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))


const prismic = require('@prismicio/client')
const prismicH = require('@prismicio/helpers');
const { create } = require('domain');
const console = require('console');
// const { response } = require('express')

const initApi = req => {
      return prismic.createClient(process.env.PRISMIC_ENDPOINT, {
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        req
      })
}

const handleLinkResolver = doc => {

  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'collections') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  // if (doc.type === 'post') {
  //  return `/blog/${doc.uid}/`
  // } else {
  //   return `/${doc.uid}`
  // }
  return '/'
 }
 
//  prismicH.asLink(document.data.example_link, linkResolver)
 // /blog/peace-on-earth


app.use((req, res, next) => {
    // res.locals.ctx = {
    //   endpoint: process.env.PRISMIC_ENDPOINT,
    //   linkResolver: handelLinkResolver
    // }

    res.locals.Link = handleLinkResolver

    res.locals.prismicH = prismicH

    res.locals.Numbers = index => {
      return  index == 0 ? 'One' : index == 1 ? 'Two' : index == 2 ? 'Three' : index == 3 ? 'Four' : ''; 
    }


    next()

})


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')


const handleRequest = async api => {
  const meta = await api.getSingle('meta')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')

  
  return{
    meta,
    navigation,
    preloader
  }

}


app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')

  const collections = await api.getAllByType('collection',{
    fetchLinks: 'product.image'
  })
  

  res.render('pages/home',{
    ...defaults,
    collections,
    home
  })
})

app.get('/about', async (req, res) => {

  

  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const about = await api.getSingle('about')

  res.render('pages/about',{
    ...defaults,
    about
  })
})

app.get('/collections',async (req, res) => {
  
  
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')
  const collections = await api.getAllByType('collection',{
    fetchLinks: 'product.image'
  })
  

  res.render('pages/collections',{
    ...defaults,
    collections,
    home,
  })
})

app.get('/detail/:uid', async (req, res) => {
  
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid,{
    fetchLinks: 'collection.title'
  })


  
  res.render('pages/detail',{
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})