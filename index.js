#!/usr/bin/env node

const {exec} = require('child_process')

const cmd = args =>
  new Promise((resolve, reject) =>
    exec(args, (err, res) => (err ? reject(err) : resolve(res))),
  )
const grepTouchpad = 'xinput list | grep ELAN'
const grepNatural = deviceId => `xinput --list-props ${deviceId} | grep Natural`
const setProp = (deviceId, propName, enable = true) =>
  `xinput --set-prop ${deviceId} "${propName}" ${enable ? 1 : 0}`

cmd(grepTouchpad)
  .then(res => {
    const parts = res.split('\t')
    const idStr = parts.find(part => part.includes('id'))
    const deviceId = +idStr.replace('id=', '')
    return cmd(grepNatural(deviceId)).then(res => [res, deviceId])
  })
  .then(([res, deviceId]) => {
    const parts = res.split(`\n`)
    const [_, prop, status] = parts
      .find(part => !part.includes('Default'))
      .split('\t')
    const enable = +status === 0
    const propName = prop
      .substr(0, prop.indexOf('('))
      .replace('\t', '')
      .trim()

    return cmd(setProp(deviceId, propName, enable))
  })
  .catch(err => {
    console.log(err)
  })
