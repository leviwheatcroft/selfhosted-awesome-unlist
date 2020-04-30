require('./components/BriefExpander')

function docReady (fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1)
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

// docReady(() => {
//   const briefs = document.querySelectorAll('.brief')
//   briefs.forEach((brief) => {
//     console.log(brief.clientHeight, brief.scrollHeight)
//     if (brief.clientHeight < brief.scrollHeight)
//       console.log(brief)
//   })
// })
