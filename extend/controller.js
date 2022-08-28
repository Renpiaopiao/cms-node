const fs = require('fs')
const path = require('path')


class Controller {
    constructor(req,res,app){
        this.req = req
        this.res = res
        this.app = app
    }
}

exports.Controller = Controller

const loadConroller = controllerPath => {
    const controllerMap  = {}
    const files =fs.readFileSync(controllerPath)
    console.log('files:',files);
    files.forEach(file =>{
        const fileState = fs.statSync(path.join(controllerPath,file))
        if(fileState.isDirectory()){  //如果是目录，则递归调用
            controllerMap[file] = {
                isDir:true,
                ...loadConroller(path.join(controllerPath,file))
            }
        }else{ 
            const controllerMap = file.substr(0,file.lastIndexof('.'))
            if(controllerName){
                controllerMap[controllerMap] = {
                    isDir:false,
                    value:require(path.join(controllerPath,file))
                }
            }
        }
    })
    return controllerMap
}

const errMsg = message => ({code:1,message,data:null})

const controllerProxy = (controllerMap,app) => {
    return new Proxy(controllerMap,{
        get(target,name){
            if(target[name]){
                if(!target[name].isDir){
                    return new Proxy(target[name],{
                        get(target,name){
                            return (req,res) => {
                                // 如果有其中某个属性
                                if(Object.getOwnPropertyNames(target.value.prototype).includes(name)){
                                    new target.value(req,res,app[name])()
                                }else {
                                    res.send(errMsg('method not exist'))
                                }
                            }
                        }
                    })
                }else { //如果是文件目录
                    return controllerProxy(target[name],app)
                }
            }else{
                return new Proxy({},{
                  get(){
                    return (req,res) => {
                        res.send(errMsg('controller not exist'))
                    }
                  }  
                })
            }
        }
    })
}

const controllerMap = loadConroller(path.join(__dirname,'../controller'))

module.exports = app => {
    app.controller = controllerProxy(controllerMap,app)
    return (req,res,next) => {
        next()
    }
}