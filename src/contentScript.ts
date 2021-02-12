import { browser, Runtime } from 'webextension-polyfill-ts'
import waitElement from '@1natsu/wait-element'
import moji from 'moji'

console.log('wakaras script start')

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

function isUserDetailInfo(path: string) {
  return path.includes('UserDetailInfo')
}

window.addEventListener('load', async () => {
  if (isUserDetailInfo(window.location.pathname)) {
    const kairiButton = document.querySelector<HTMLElement>(
      '#kibanaOpen.btn-warning',
    )

    if (!kairiButton) {
      return
    }

    const theDayTableRowElement = kairiButton.closest('tr')
    if (!theDayTableRowElement) {
      throw new Error('rowの親DOM見つからへん')
    }

    const theDayKairiData = getKairiDataFromRow(theDayTableRowElement)

    kairiButton.click()

    // モーダルの出現を待つ
    const modalOpended = await waitElement(
      '#modalDivergence.modal.fade.in',
    ).then(() => delay(300))

    const kairiReasonInput = document.querySelector<HTMLInputElement>(
      '#reasontext',
    )
    const kairiReasonSaveButton = document.querySelector<HTMLButtonElement>(
      '#divergenceSave',
    )

    const reasonSelectDescription = (() => {
      const templateSelects = Object.entries(reasonOptionMap).map(
        ([key, value]) => {
          return `${key}: ${value}`
        },
      )

      const selects = [
        createKairiDataDescription(theDayKairiData),
        ...templateSelects,
      ]

      return selects.join('\n')
    })()

    const kairiReasonSelected = prompt(reasonSelectDescription)

    console.log(kairiReasonSelected)

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

type KairiData = {
  date: string
  kaishi: {
    dakoku?: string
    jissai?: string
  }
  taikin: {
    dakoku?: string
    jissai?: string
  }
  kairiTime?: string
}

function getKairiDataFromRow(rowNode: HTMLTableRowElement): KairiData {
  const cols = [...rowNode.children] as HTMLElement[]
  if (!cols.length) {
    throw new Error(
      'なんかしらんけどカラムらしきDOM見当たらへんで。行のDOMミスってるか見当違いのDOM渡してへん？',
    )
  }
  const [
    date,
    _name,
    kaishiDakoku,
    kaishiJissai,
    taikinDakoku,
    taikinJissai,
    _kintaiMinyuryoku,
    kairiTime,
  ] = cols.map((col) => col.innerText)
  return {
    date,
    kaishi: {
      dakoku: kaishiDakoku,
      jissai: kaishiJissai,
    },
    taikin: {
      dakoku: taikinDakoku,
      jissai: taikinJissai,
    },
    kairiTime,
  }
}

function createKairiDataDescription(kairiData: KairiData) {
  const { date, kaishi, taikin, kairiTime } = kairiData
  return `テンプレ数字or理由を入力してください
${date}
開始の打刻は ${kaishi.dakoku || '?'} でしたが実際は ${kaishi.jissai || '?'
    } でした。
退勤の打刻は ${taikin.dakoku || '?'} でしたが実際は ${taikin.jissai || '?'
    } でした。
トータルの乖離時間は ${kairiTime} です。
`
}

////////////////////////////////////////////////////////////////
/**
 * 乖離理由の定義と変換くん
 */
////////////////////////////////////////////////////////////////

const reasonOptionMap = {
  '1': '退勤後にキーボード清掃のため再度PCを開いたため',
  '2': '退勤後にオンライン雑談をしていたため',
  '3': '退勤後に技術の勉強をしていたため',
  '4': '退勤後にOSS活動をしていたため',
} as const

type ReasonOptionKeys = keyof typeof reasonOptionMap

function convertToKairiReason(keyOrReason: string) {
  // 全角文字 to 半角文字
  const HEkeyOrReason = moji(keyOrReason).convert('ZE', 'HE').toString()

  const isDefinedKey = (
    HEkeyOrReason: string,
  ): HEkeyOrReason is ReasonOptionKeys =>
    Object.keys(reasonOptionMap).includes(HEkeyOrReason)

  if (isDefinedKey(HEkeyOrReason)) {
    return reasonOptionMap[HEkeyOrReason]
  } else {
    return HEkeyOrReason
  }
}
