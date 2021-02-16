import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { browser } from 'webextension-polyfill-ts'
// import { browser, Runtime } from 'webextension-polyfill-ts'

function App() {
  const [inputValues, setInputValues] = useState<{ [K: string]: string }>({
    1: '',
  })

  useEffect(() => {
    const getStorage = async () => {
      return await browser.storage.sync.get('wakarasTemplateOptions')
    }

    getStorage().then(({ wakarasTemplateOptions }) => {
      const convertedValues = (wakarasTemplateOptions as {
        key: string
        value: string
      }[]).reduce(
        (acc, current) => ({ ...acc, [current.key]: current.value }),
        {},
      )
      setInputValues(convertedValues)
    })
  }, [])

  console.log(inputValues)

  const handleOnInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValues((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }))
    },
    [],
  )
  const addInputField = useCallback(() => {
    const fieldNumbers = [...Object.keys(inputValues).map((v) => Number(v))]
    const maxNum = Math.max(...fieldNumbers)
    const nextNum = maxNum + 1
    setInputValues((v) => ({ ...v, [nextNum]: '' }))
  }, [inputValues])

  const onSubmit = useCallback(async () => {
    const templates = Object.keys(inputValues).map((_, index) => ({
      key: [index + 1],
      value: inputValues[index + 1],
    }))
    try {
      await browser.storage.sync.set({
        wakarasTemplateOptions: templates,
      })
      console.log(
        'db',
        await browser.storage.sync.get('wakarasTemplateOptions'),
      )
      alert('保存しました')
    } catch (error) {
      console.error(error)
      alert('保存できんかった')
    }
  }, [inputValues])

  return (
    <main>
      <form>
        {Object.keys(inputValues).map((key) => (
          <label key={key} style={{ display: 'block' }}>
            {key}:
            <input
              name={key}
              type="text"
              value={inputValues[key]}
              onChange={handleOnInput}
              style={{ minWidth: 500, marginBottom: 10 }}
            />
          </label>
        ))}
      </form>
      <button onClick={addInputField}>項目を追加する</button>
      <button onClick={onSubmit}>保存する</button>
    </main>
  )
}

const mountNode = document.getElementById('app')
ReactDOM.render(<App />, mountNode)
