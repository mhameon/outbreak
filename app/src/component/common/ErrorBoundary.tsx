import React, { type ErrorInfo, type PropsWithChildren } from 'react'

interface Props extends React.PropsWithChildren {
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch (error: Error, info: ErrorInfo) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.error('componentDidCatch', { error, info })
    this.setState({ hasError: true })
  }

  render (): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <h1>Something goes wrong</h1>
    }

    return this.props.children
  }
}
