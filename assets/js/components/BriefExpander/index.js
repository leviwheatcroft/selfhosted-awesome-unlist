const feather = require('feather-icons')
const template = require('./BriefExpander.pug')
require('./BriefExpander.less')

class BriefExpander extends HTMLElement {
  connectedCallback () {
    const parent = this.parentElement
    this.isExpandable()
    if (!parent.classList.contains('expandable'))
      return
    this.innerHTML = template({ feather })
    const toggleExpanded = this.toggleExpanded.bind(this)
    this.querySelector('.expand').addEventListener('click', toggleExpanded)
    this.querySelector('.unexpand').addEventListener('click', toggleExpanded)
  }

  isExpandable () {
    const parent = this.parentElement
    if (parent.scrollHeight > 240)
      parent.classList.add('expandable')
  }

  toggleExpanded () {
    const parent = this.parentElement
    parent.classList.toggle('expanded')
  }
}

customElements.define('brief-expander', BriefExpander)
