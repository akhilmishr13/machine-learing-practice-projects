#!/bin/bash
# Get local IP address for accessing the webapp from other devices

echo "🌐 Finding your local IP address..."
echo ""

# Try different methods to get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "Not found")
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "Not found")
else
    IP=$(ipconfig | grep -i "IPv4" | head -1 | awk '{print $NF}' 2>/dev/null || echo "Not found")
fi

if [ "$IP" != "Not found" ]; then
    echo "✅ Your local IP address is: $IP"
    echo ""
    echo "📱 Access the webapp from other devices on your network:"
    echo "   http://$IP:3000"
    echo ""
    echo "💡 Make sure:"
    echo "   1. Both devices are on the same WiFi network"
    echo "   2. Your firewall allows connections on port 3000"
    echo "   3. The backend is running on port 8000"
else
    echo "❌ Could not determine local IP address"
    echo "   Please check your network connection"
fi

