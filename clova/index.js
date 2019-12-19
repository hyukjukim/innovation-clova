const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN } = require('../config')
console.log("4");

class Directive {
  constructor({namespace, name, payload}) {
    console.log("5");
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

// function resultText({midText, sum, diceCount}) {
//   if (diceCount == 1) {
//     return `결과는 ${sum}입니다.`
//   } else if (diceCount < 4) {
//     return `결과는 ${midText} 이며 합은 ${sum} 입니다.`
//   } else {
//     return `주사위 ${diceCount}개의 합은 ${sum} 입니다.`
//   }
// }

// function throwDice(diceCount) {
//   const results = []
//   let midText = ''
//   let resultText = ''
//   let sum = 0
//   console.log(`throw ${diceCount} times`)
//   for (let i = 0; i < diceCount; i++) {
//     const rand = Math.floor(Math.random() * 6) + 1
//     console.log(`${i + 1} time: ${rand}`)
//     results.push(rand)
//     sum += rand
//     midText += `${rand}, `
//   }

//   midText = midText.replace(/, $/, '')
//   return {midText, sum, diceCount}
// }

class CEKRequest {
  constructor (httpReq) {
    console.log("6");
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('이노베이션 그룹의 음성인식 AI 샘플 코드 입니다. 샘플 코드는 피자 주문 입니다.')
    cekResponse.setMultiturn({
      intent: 'OrderPizza',
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
    case 'OrderPizza':
      let pizzaAmount = 0
      let pizzaType = ''
      if (!!slots) {
        const Amount = slots.pizzaAmount
        const Type = slots.pizzaType
        if (slots.length != 0 && Amount) {
          pizzaAmount = parseInt(Amount.value)
        }
        if (slots.length != 0 && Type) {
          pizzaType = Type.value
        }
        console.log("@@@@@@@@@@@@"+pizzaType+"@@@@@@@@@@@@"+pizzaAmount)
      }



      cekResponse.appendSpeechText(`이노베이션 피자집에 ${pizzaType}피자 ${pizzaAmount}개 주문합니다.`)
      // cekResponse.appendSpeechText({
      //   lang: 'ko',
      //   type: 'URL',
      //   value: `${DOMAIN}/rolling_dice_sound.mp3`,
      // })
      // const throwResult = throwDice(diceCount)
      // cekResponse.appendSpeechText(resultText(throwResult))
      break
    case 'Clova.GuideIntent':
    default:
      cekResponse.setSimpleSpeechText("피자 종류는 쉬림프 골드 크러스트, 야채, 치즈, 바베큐, 페퍼로니 이렇게 5종류가 있습니다.")
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('이노베이션샘플 피자 주문 서비스를 종료합니다. 감사합니다.')
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
