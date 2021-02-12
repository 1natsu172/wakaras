import { browser, Runtime } from "webextension-polyfill-ts"
import waitElement from '@1natsu/wait-element'
import moji from 'moji'

console.log('wakaras script start');

const delay = (ms: number) => new Promise<void>(resolve => {
  setTimeout(() => {
    resolve()
  }, ms);
})

function isUserDetailInfo(path: string) {
  return path.includes('UserDetailInfo')
}

window.addEventListener('load', async () => {
  if (isUserDetailInfo(window.location.pathname)) {
    const kairiButton = document.querySelector<HTMLElement>('#kibanaOpen.btn-warning')

    if (!kairiButton) {
      return
    }

    kairiButton.click();


    // モーダルの出現を待つ
    const modalOpended = await waitElement('#modalDivergence.modal.fade.in').then(() => delay(300))

    const kairiReasonInput = document.querySelector<HTMLInputElement>('#reasontext')
    const kairiReasonSaveButton = document.querySelector<HTMLButtonElement>('#divergenceSave');

    const reasonSelectDescription = (() => {
      const selects = Object.entries(reasonOptionMap).map((([key, value]) => {
        return `${key}: ${value}`
      }))
      selects.unshift(`当てはまるものの数字を選んで入力してください\n`)
      selects.push(`\nその他の理由の場合は、理由をここに書いてください`)
      return selects.join('\n')
    })()

    const kairiReasonSelected = prompt(reasonSelectDescription)

    console.log(kairiReasonSelected);

    if (kairiReasonSelected && kairiReasonInput) {
      const kairiReason = convertToKairiReason(kairiReasonSelected)
      kairiReasonInput.value = kairiReason
    }

    if (kairiReasonSaveButton) {
      // kairiReasonSaveButton.click()
    }
  }
})


////////////////////////////////////////////////////////////////
/**
 * 乖離データパースしたりなんやら
 */
////////////////////////////////////////////////////////////////

function a(rowNode: HTMLElement) {

}


////////////////////////////////////////////////////////////////
/**
 * 乖離理由の定義と変換くん
 */
////////////////////////////////////////////////////////////////

const reasonOptionMap = {
  "1": '退勤後にキーボード清掃のため再度PCを開いたため',
  "2": '退勤後にオンライン雑談をしていたため',
  "3": '退勤後に技術の勉強をしていたため',
  "4": '退勤後にOSS活動をしていたため',
} as const

type ReasonOptionKeys = keyof typeof reasonOptionMap

function convertToKairiReason(keyOrReason: string) {
  // 全角文字 to 半角文字
  const HEkeyOrReason = moji(keyOrReason).convert('ZE', 'HE').toString();

  const isDefinedKey = (HEkeyOrReason: string): HEkeyOrReason is ReasonOptionKeys => Object.keys(reasonOptionMap).includes(HEkeyOrReason)

  if (isDefinedKey(HEkeyOrReason)) {
    return reasonOptionMap[HEkeyOrReason]
  } else {
    return HEkeyOrReason
  }
}