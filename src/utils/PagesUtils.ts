export function customAlert3Prompts(
  title: string | null,
  text: string | null,
  checkbox1Data: {
    text: string
  },
  checkbox2Data: {
    text: string
  },
  button1Data: {
    text: string
    color: string
    callback: () => void
  },
  button3Data: {
    text: string
    color: string
    callback: () => void
  }
) {
  // Create and apply the blur effect
  const bodyChildren = document.body.children
  for (const c of bodyChildren) {
    const child = c as HTMLElement
    if (child.id === '_pkiPopup') {
      //dont blur
    } else {
      child.style.transition = 'filter 0.5s'
      child.style.filter = 'blur(0px)'
    }
  }

  // Create overlay
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.zIndex = '999'
  document.body.appendChild(overlay)

  // Create modal
  const modal = document.createElement('div')
  modal.style.cssText = `
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -60%) !important;
  background-color: white !important;
  padding: 40px !important;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5) !important;
  z-index: 1000 !important;
  text-align: center !important;
  opacity: 0 !important;
  transition: opacity 0.5s, transform 0.5s !important;
  border-radius: 15px !important;
  width: 50% !important;
`
  modal.id = '_pkiPopup'
  document.body.appendChild(modal)

  // Trigger the animation
  requestAnimationFrame(() => {
    for (const c of bodyChildren) {
      const child = c as HTMLElement
      if (child.id !== '_pkiPopup') {
        child.style.filter = 'blur(2px)'
      }
    }
    modal.style.opacity = '1'
    modal.style.transform = 'translate(-50%, -50%)'
  })

  // Add title to modal
  const modalTitle = document.createElement('h2')
  modalTitle.textContent = title
  modalTitle.style.cssText = `
  color: black !important;
  margin-bottom: 10px !important;`
  // modalTitle.style.color = 'black'
  // modalTitle.style.marginBottom = '10px'
  modal.appendChild(modalTitle)

  // Add text to modal
  const modalText = document.createElement('p')
  modalText.textContent = text
  modalText.style.cssText = `
    color: black !important;
    font-size: 18px !important;
    margin-bottom: 20px !important;
  `
  // modalText.style.color = 'black'
  // modalText.style.fontSize = '18px'
  // modalText.style.marginBottom = '20px'
  modal.appendChild(modalText)

  // Add checkboxes to modal
  const d = document.createElement('div')

  const checkbox1 = document.createElement('input')
  checkbox1.type = 'checkbox'
  checkbox1.id = '_pkiPopupCheckbox1'
  checkbox1.textContent = checkbox1Data.text
  checkbox1.style.flexBasis = '50%'
  const label1 = document.createElement('label')
  label1.htmlFor = '_pkiPopupCheckbox1'
  label1.textContent = checkbox1Data.text
  label1.style.cssText = `
    flex-basis: 50% !important;
    color: black !important;
    margin-right: 10px !important;
    visibility: inherit !important;
  `
  // label1.style.color = 'black'
  // label1.style.marginRight = '10px'
  // label1.style.flexBasis = '50%'
  // label1.style.visibility = 'inherit'
  d.appendChild(checkbox1)
  d.appendChild(label1)

  const d2 = document.createElement('div')
  const checkbox2 = document.createElement('input')
  checkbox2.type = 'checkbox'
  checkbox2.id = '_pkiPopupCheckbox2'
  checkbox2.style.flexBasis = '50%'
  const label2 = document.createElement('label')
  label2.htmlFor = '_pkiPopupCheckbox2'
  label2.textContent = checkbox2Data.text
  label2.style.cssText = `
    flex-basis: 50% !important;
    color: black !important;
    visibility: inherit !important;
  `
  // label2.style.color = 'black'
  // label2.style.flexBasis = '50%'
  // label2.style.visibility = 'inherit'
  d2.appendChild(checkbox2)
  d2.appendChild(label2)
  const checkboxContainer = document.createElement('div')
  checkboxContainer.style.cssText = `
    margin-bottom: 20px !important;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-around;
  `
  // checkboxContainer.style.marginBottom = '20px'
  // checkboxContainer.style.display = 'flex'
  // checkboxContainer.style.flexDirection = 'row'
  // checkboxContainer.style.alignItems = 'flex-start'
  // checkboxContainer.style.justifyContent = 'center'
  checkboxContainer.append(d)
  checkboxContainer.append(d2)

  modal.appendChild(checkboxContainer)

  // Create buttons and add event listeners to unblur the page
  const createButton = (
    buttonText: string | null,
    color: string,
    callback?: () => void
  ) => {
    const button = document.createElement('button')
    button.textContent = buttonText
    button.style.margin = '5px'
    button.style.padding = '10px 20px'
    button.style.border = 'none'
    button.style.borderRadius = '25px'
    button.style.color = 'white'
    button.style.backgroundColor = color
    button.style.cursor = 'pointer'
    button.style.transition = 'background-color 0.3s'
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = shadeColor(color, -20)
    })
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = color
    })
    button.addEventListener('click', () => {
      if (callback) {
        callback()
      }
      for (const c of bodyChildren) {
        const child = c as HTMLElement
        if (child.id !== '_pkiPopup') {
          child.style.filter = 'none'
        }
      }
      document.body.removeChild(modal)
      document.body.removeChild(overlay)
    })
    return button
  }

  modal.appendChild(
    createButton(button1Data.text, button1Data.color, button1Data.callback)
  )
  modal.appendChild(
    createButton(button3Data.text, button3Data.color, button3Data.callback)
  )
}

export function customAlertUpdatePrompt(
  title: string | null,
  text: string | null,
  // checkbox1Data: {
  //   text: string
  // },
  // checkbox2Data: {
  //   text: string
  // },
  button1Data: {
    text: string
    color: string
    callback: () => void
  },
  button2Data: {
    text: string
    color: string
    callback: () => void
  }
) {
  // Create and apply the blur effect
  const bodyChildren = document.body.children
  for (const c of bodyChildren) {
    const child = c as HTMLElement
    if (child.id === '_pkiPopup') {
      //dont blur
    } else {
      child.style.transition = 'filter 0.5s'
      child.style.filter = 'blur(0px)'
    }
  }

  // Create overlay
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.zIndex = '999'
  document.body.appendChild(overlay)

  // Create modal
  const modal = document.createElement('div')
  modal.style.position = 'fixed'
  modal.style.top = '50%'
  modal.style.left = '50%'
  modal.style.transform = 'translate(-50%, -50%)'
  modal.style.backgroundColor = 'white'
  modal.style.padding = '40px'
  modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)'
  modal.style.zIndex = '1000'
  modal.style.textAlign = 'center'
  modal.style.opacity = '0'
  modal.style.transition = 'opacity 0.5s, transform 0.5s'
  modal.style.transform = 'translate(-50%, -60%)'
  modal.style.borderRadius = '15px'
  modal.style.width = '50%'
  modal.id = '_pkiPopup'
  document.body.appendChild(modal)

  // Trigger the animation
  requestAnimationFrame(() => {
    for (const c of bodyChildren) {
      const child = c as HTMLElement
      if (child.id !== '_pkiPopup') {
        child.style.filter = 'blur(2px)'
      }
    }
    modal.style.opacity = '1'
    modal.style.transform = 'translate(-50%, -50%)'
  })

  // Add title to modal
  const modalTitle = document.createElement('h2')
  modalTitle.textContent = title
  modalTitle.style.color = 'black'
  modalTitle.style.marginBottom = '10px'
  modal.appendChild(modalTitle)

  // Add text to modal
  const modalText = document.createElement('p')
  modalText.textContent = text
  modalText.style.color = 'black'
  modalText.style.fontSize = '18px'
  modalText.style.marginBottom = '20px'
  modal.appendChild(modalText)

  // Create buttons and add event listeners to unblur the page
  const createButton = (
    buttonText: string | null,
    color: string,
    callback?: () => void
  ) => {
    const button = document.createElement('button')
    button.textContent = buttonText
    button.style.margin = '5px'
    button.style.padding = '10px 20px'
    button.style.border = 'none'
    button.style.borderRadius = '25px'
    button.style.color = 'white'
    button.style.backgroundColor = color
    button.style.cursor = 'pointer'
    button.style.transition = 'background-color 0.3s'
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = shadeColor(color, -20)
    })
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = color
    })
    button.addEventListener('click', () => {
      if (callback) {
        callback()
      }
      for (const c of bodyChildren) {
        const child = c as HTMLElement
        if (child.id !== '_pkiPopup') {
          child.style.filter = 'none'
        }
      }
      document.body.removeChild(modal)
      document.body.removeChild(overlay)
    })
    return button
  }

  modal.appendChild(
    createButton(button1Data.text, button1Data.color, button1Data.callback)
  )
  modal.appendChild(
    createButton(button2Data.text, button2Data.color, button2Data.callback)
  )
}

// Function to darken color on hover
function shadeColor(color: string, percent: number) {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}
