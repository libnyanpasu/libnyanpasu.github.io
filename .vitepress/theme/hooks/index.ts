export const getMainSection = () => {
  return document.getElementById('main-section')
}

export const useMainSectionOnScroll = (
  event: (this: HTMLElement, ev: Event) => any
) => {
  getMainSection()?.addEventListener('scroll', event)
}

export const getMainSectionInnerHeight = () => {
  return document.querySelector('#main-section > div')!.clientHeight
}
