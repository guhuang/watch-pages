#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

let watched = false
const filePath = path.resolve(process.cwd(), 'app.json')

async function generateFiles () {
    const pages = await getPagesConfig()
    const extArr = ['.js', '.json', '.wxss', '.wxml']
    for (const page of pages) {
        const dir = page.split('/').slice(0, -1).join('/')
        for (const ext of extArr) {
            const relateFilePath = `${page}${ext}`
            await checkFileNotExitsAndCreate(relateFilePath, dir)
        }
    }
    if (!watched) {
        fs.watch(filePath, (eventType, filename) => {
            console.info(`watch>>>eventType:${eventType}:::::filename:${filename}`)
            generateFiles()
        })
    }
}

function getPagesConfig () {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, content) => {
            if (err) {
                console.error('app.json not exists!!!')
                reject(err)
            } else {
                const { pages } = JSON.parse(content)
                if (!pages) {
                    reject('"pages" property not exists!!!')
                } else {
                    resolve(pages)
                }
            }
        })
    })
}

function checkFileNotExitsAndCreate (filePath, dir) {
    return new Promise((resolve, reject) => {
        try {
            fs.open(filePath, 'wx', async (err, fd) => {
                if (err && err.code === 'EEXIST') {
                    console.info(`${filePath} has already exists.`)
                    resolve()
                } else {
                    await createDir(dir)
                    resolve(createFile(filePath))
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}

function createDir (dir) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, { recursive: true }, err => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

function createFile (filePath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, '// auto generate content', err => {
            if (err) {
                reject(err)
            } else {
                console.info(`${filePath} create success.`)
                resolve()
            }
        })
    })
}

generateFiles()