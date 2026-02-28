


from django.shortcuts import render


def index(request):
    return render(request,'index.html')



def buyerRegisterForm(request):
    return render(request,'buyerRegisterForm.html')

def buyerLoginForm(request):
    return render(request,'buyerLoginForm.html')
def adminLoginForm(request):
    return render(request,'adminLoginForm.html')


def sellerRegisterForm(request):
    return render(request,'sellerRegisterForm.html')


def sellerLoginForm(request):
    return render(request,'sellerLoginForm.html')