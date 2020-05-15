const feather = require('feather-icons')
const classnames = require('classnames')
const template = require('./TagListFilters.pug')

require('./TagList.less')

class TagList extends HTMLElement {
  connectedCallback () {
    const filters = this.getFilters()
    this.applyFilters()
    this.querySelector('.tagListFiltersButton').addEventListener(
      'click',
      () => this.querySelector('.tagListFilters').classList.add('unhide')
    )
    this.insertAdjacentHTML('beforeend', template({
      feather,
      filters,
      classnames
    }))
    this.querySelector('.tagListFilters').addEventListener(
      'click',
      () => {
        this.querySelector('.tagListFilters').classList.remove('unhide')
      }
    )
    this.querySelectorAll('li').forEach((li) => {
      li.addEventListener(
        'click',
        (event) => {
          event.target.classList.toggle('selected')
          event.stopPropagation()
        }
      )
    })
    this.querySelector('.tagListFilters .apply')
      .addEventListener('click', this.applyHandler.bind(this))
  }

  applyHandler () {
    this.setFilters(this.selectedFilters())
    console.log('selected', typeof this.selectedFilters())
    this.applyFilters()
  }

  selectedFilters () {
    const selected = []
    this.querySelectorAll('li.filter.selected').forEach((li) => {
      selected.push(li.dataset.category)
    })
    return selected
  }

  applyFilters () {
    const filters = this.getFilters()
    console.log(filters)
    console.log(typeof filters)
    const tagListLis = this.querySelectorAll('.tagList li')
    const tagCount = tagListLis.length
    tagListLis.forEach((li) => {
      if (filters.includes(li.dataset.category))
        li.classList.remove('hide')
      else
        li.classList.add('hide')
    })
    const hiddenCount = this.querySelectorAll('.tagList li.hide').length
    const shownCount = tagCount - hiddenCount
    const countText = `[${shownCount}/${tagCount}]`
    this.querySelector('.tagListFiltersCount').textContent = countText
    if (filters.length === 0)
      this.querySelector('.shrug').classList.remove('hide')
    else
      this.querySelector('.shrug').classList.add('hide')
  }

  setFilters (filters) {
    localStorage.setItem('filters', filters)
  }

  getFilters () {
    const filters = localStorage.getItem('filters')
    if (filters === '')
      return []
    if (filters)
      return filters.split(',')
    return [
      'languages',
      'databases',
      'libraries',
      'other'
    ]
  }
}

customElements.define('tag-list', TagList)
