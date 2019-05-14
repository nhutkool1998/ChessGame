var verticalLineRule = function(x,y,newX,newY,mapWidth){
    if (Math.abs(x - newX) > 0)
        return false; 
    if (newY <= 0  || newY > mapWidth) 
        return false; 
    return true; 
}

var horizontalLineRule = function(x,y,newX,newY,mapHeight){
    if (Math.abs(y - newY) > 0)
        return false; 
    if (newX <= 0  || newX > mapWidth) 
        return false; 
    return true; 
}

var crossLineRule = function(x,y,newX,newY){
    var deltaX = Math.abs(newX-x);
    var deltaY = Math.abs(newY-y); 
    if (deltaX == 1 && deltaY == 1)
        return true; 
    return false; 
}

var knightRule = function(x,y,newX,newY){
    var deltaX = Math.abs(newX-x);
    var deltaY = Math.abs(newY-y);  
    if (deltaX == 2 && deltaY ==1) 
        return true; 
    if (deltaX == 1 && deltaY ==2) 
        return false; 
}

