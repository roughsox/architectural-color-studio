"""Reference audit, 2026-11-15: measure sampled regions of the two reference images against Wada #231 targets.

Usage: python3 measure_reference.py <dir containing room-231.png and swatch-options.png>
The images are the two served by the reference site under /images/. They are not stored in this repository.
Regions are hand-placed rectangles (x0, y0, x1, y1) on flat, evenly lit parts of each surface; the statistic is
the per-channel median. Pixels are assumed sRGB (the PNGs carry no colour profile). Needs Pillow and numpy.
"""
import sys, numpy as np
from PIL import Image
def srgb2lab(rgb):
    c = np.asarray(rgb, float)/255
    c = np.where(c<=0.04045, c/12.92, ((c+0.055)/1.055)**2.4)
    M = np.array([[0.4124564,0.3575761,0.1804375],[0.2126729,0.7151522,0.0721750],[0.0193339,0.1191920,0.9503041]])
    xyz = c@M.T/np.array([0.95047,1,1.08883])
    f = np.where(xyz>0.008856, np.cbrt(xyz), 7.787*xyz+16/116)
    return np.stack([116*f[...,1]-16, 500*(f[...,0]-f[...,1]), 200*(f[...,1]-f[...,2])],-1)
def de2000(l1,l2):
    L1,a1,b1=l1; L2,a2,b2=l2
    C1=np.hypot(a1,b1); C2=np.hypot(a2,b2); Cb=(C1+C2)/2
    G=0.5*(1-np.sqrt(Cb**7/(Cb**7+25**7)))
    a1p=(1+G)*a1; a2p=(1+G)*a2
    C1p=np.hypot(a1p,b1); C2p=np.hypot(a2p,b2)
    h1=np.degrees(np.arctan2(b1,a1p))%360; h2=np.degrees(np.arctan2(b2,a2p))%360
    dL=L2-L1; dC=C2p-C1p
    dh=h2-h1
    if abs(dh)>180: dh-=360*np.sign(dh)
    dH=2*np.sqrt(C1p*C2p)*np.sin(np.radians(dh/2))
    Lb=(L1+L2)/2; Cbp=(C1p+C2p)/2
    hb=(h1+h2)/2 if abs(h1-h2)<=180 else (h1+h2+360)/2%360
    T=1-0.17*np.cos(np.radians(hb-30))+0.24*np.cos(np.radians(2*hb))+0.32*np.cos(np.radians(3*hb+6))-0.20*np.cos(np.radians(4*hb-63))
    Sl=1+0.015*(Lb-50)**2/np.sqrt(20+(Lb-50)**2); Sc=1+0.045*Cbp; Sh=1+0.015*Cbp*T
    Rt=-2*np.sqrt(Cbp**7/(Cbp**7+25**7))*np.sin(np.radians(60*np.exp(-((hb-275)/25)**2)))
    return float(np.sqrt((dL/Sl)**2+(dC/Sc)**2+(dH/Sh)**2+Rt*(dC/Sc)*(dH/Sh)))
def hx(h): return [int(h[i:i+2],16) for i in (1,3,5)]
def report(path, regions):
    im=np.asarray(Image.open(path).convert('RGB'))
    print(path.split('/')[-1], im.shape)
    for name,target,(x0,y0,x1,y1) in regions:
        p=im[y0:y1,x0:x1].reshape(-1,3)
        med=np.median(p,0); lab=srgb2lab(med); t=srgb2lab(hx(target))
        lch=lambda l:(l[0],np.hypot(l[1],l[2]),np.degrees(np.arctan2(l[2],l[1]))%360)
        tl,sl=lch(t),lch(lab)
        print(f"  {name:22s} target {target} sample #{''.join('%02x'%int(v) for v in med)}  dE76 {np.linalg.norm(lab-t):5.1f}  dE00 {de2000(t,lab):5.1f}  dL {sl[0]-tl[0]:+5.1f} dC {sl[1]-tl[1]:+5.1f} dh {((sl[2]-tl[2]+180)%360)-180:+6.1f}")
d=sys.argv[1]
report(d+'/room-231.png',[('wall panel (centre)','#e0b3b6',(440,500,610,660)),('wall panel (left)','#e0b3b6',(190,490,290,560)),('ceiling','#e0b3b6',(330,250,720,330)),
 ('chair leather L','#793327',(60,940,180,990)),('chair leather R','#793327',(870,950,980,1000)),('sofa front','#5a82b3',(300,930,440,975)),('sofa back','#5a82b3',(420,860,640,890))])
report(d+'/swatch-options.png',[('Cameo Pink card','#e0b3b6',(1080,190,1460,250)),("Hay's Russet card",'#793327',(1080,445,1460,500)),('Olympic Blue card','#5a82b3',(1080,705,1460,760)),
 ('Ivory Buff card','#ebd3a2',(80,190,460,250)),('Green Blue card','#099197',(80,705,460,760))])
