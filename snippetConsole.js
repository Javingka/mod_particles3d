var ev = {}; ev.data = [0, 10, [[1,0,0],[0,1,0],[0,0,1],[1,0,1]],  [-1,0,1,0],[0,0,0,.5],[0,0,0,0], 0,  ]; onMessageReceived(ev);

var pp = [ [[50,50,50], [-50,-50,-50]], [[0,0,0],[0,0,100]], [[-50,-50,-50], [0,0,-100]], [[0,0,0],[100,0,100]] ]; var pc = [ [1,0,0],[0,1,0],[0,0,1],[0,1,1] ];  

particleSystem.addcustomEdges(pp,1,pc);