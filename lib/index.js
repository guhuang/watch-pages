#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function generateFiles (sourceJsonFile) {
    fs.readFile(sourceJsonFile, 'utf-8', (err, content) => {
        if (err) {
            console.error('app.json not exists!!!')
            return
        }
        const obj = JSON.parse(content)
        if (!obj.pages) {
            throw new Error('json文件配置缺少pages字段！！！')
        }
        obj.pages.forEach(page => {
            createDir(page)
        })
    })
}

const targetFilePath = path.resolve(process.cwd(), 'app.json')
generateFiles(targetFilePath)

// fs.watch(targetFilePath, (eventType, filename) => {
//     console.log('eventType=>', eventType, '::::', 'filename=>', filename)
//     generateFiles(filename)
// })
function createDir (page) {
    const pathArr = page.split('/')
    const filename = pathArr.pop()
    const dirname = pathArr.join('/')
    const absolutePath = path.resolve(process.cwd(), './', dirname)
    fs.access(absolutePath, fs.constants.R_OK, err => {
        if (err) {
            fs.mkdir(absolutePath, { recursive: true }, err => {
                if (err) {
                    throw err
                }
                console.log(absolutePath, '文件目录创建成功...')
                createFile(absolutePath, filename)
            })
        } else {
            console.log('目录已存在')
            createFile(absolutePath, filename)
        }
    })
}
function createFile (dirname, filename) {
    const extArr = ['.js', '.wxml', '.wxss', '.json']
    extArr.forEach(ext => {
        const targetPath = `${dirname}/${filename}${ext}`
        fs.open(targetPath, 'wx', (err, fd) => {
            if (!err) {
                try {
                    fs.writeFile(targetPath, '//自动生成的文件', err => {
                        if (err) {
                            throw err
                        }
                        console.log(`创建${filename}${ext}成功；`)
                    })
                } finally {
                    fs.close(fd, err => {
                        if (err) throw err
                    })
                }
            } else if (err.code === 'EEXIST') {
                console.error(`${targetPath} already exists!!!`)
            }
        })
    })
}
