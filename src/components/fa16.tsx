import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
export default function FaIcon({icon,size}:{icon:any,size:number}){
    return (
        <FontAwesomeIcon icon={icon} width={size} height={size}/>
    )
}