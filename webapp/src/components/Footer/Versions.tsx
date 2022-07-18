import ClientVersion from './ClientVersion'
import ServerVersion from './ServerVersion'

type VersionsProps = { wrapper: (props: any) => JSX.Element }
export default function Versions({ wrapper: Wrapper }: VersionsProps) {
  return (
    <>
      <Wrapper>
        <ClientVersion />
      </Wrapper>
      <Wrapper>
        <ServerVersion />
      </Wrapper>
    </>
  )
}
