import { useNotificationValue } from '../NotificationContext'
import { Alert } from 'react-bootstrap'

const Notification = () => {
    const style = {
        border: 'solid',
        padding: 10,
        borderWidth: 1,
        marginBottom: 5,
    }

    const notification = useNotificationValue()

    if (notification === null) return null

    return <Alert variant="success">{notification}</Alert>
}

export default Notification
