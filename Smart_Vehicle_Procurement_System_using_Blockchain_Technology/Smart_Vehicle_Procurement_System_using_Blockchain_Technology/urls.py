"""Smart_Vehicle_Procurement_System_using_Blockchain_Technology URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static
from django.urls import path
from Admin import views as av
from Buyers import views as bv
from Smart_Vehicle_Procurement_System_using_Blockchain_Technology import views as mv
from seller import views as sv
from Buyers import api_views as api
urlpatterns = [
    path('admin/', admin.site.urls),
    path('',mv.index,name='index'),

    path('buyerRegisterForm',mv.buyerRegisterForm,name='buyerRegisterForm'),
    path('buyerLoginForm',mv.buyerLoginForm,name='buyerLoginForm'),
    path('adminLoginForm',mv.adminLoginForm,name='adminLoginForm'),
    path('sellerRegisterForm',mv.sellerRegisterForm,name='sellerRegisterForm'),
    path('sellerLoginForm',mv.sellerLoginForm,name='sellerLoginForm'),

    
    #ADMINURLS

    path('adminLoginCheck',av.adminLoginCheck,name='adminLoginCheck'),
    path('adminHome',av.adminHome,name='adminHome'),
    path('userdetails',av.userList,name='userdetails'),
    path('activate_user',av.activate_user,name='activate_user'),
    path('deactivate_user',av.deactivate_user,name='deactivate_user'),
    path('sellerdetails',av.sellerdetails,name='sellerdetails'),
    path('Sdeactivate_user',av.Sdeactivate_user,name='Sdeactivate_user'),
    path('Sactivate_user',av.Sactivate_user,name='Sactivate_user'),



    
    
    #buyerURLS
    path('buyerHome',bv.buyerHome,name='buyerHome'),
    path('buyerRegisterCheck',bv.buyerRegisterCheck,name='buyerRegisterCheck'),
    path('buyerLoginCheck',bv.buyerLoginCheck,name='buyerLoginCheck'),
    path('browseVehicles',bv.browseVehicles,name='browseVehicles'),
    path('purchase_vehicle',bv.purchase_vehicle,name='purchase_vehicle'),
    path('purchaseHistory', bv.purchase_history, name='purchaseHistory'),
    



    #sellerRegisterCheck
    path('sellerRegisterCheck',sv.sellerRegisterCheck,name='sellerRegisterCheck'),
    path('sellerLoginCheck',sv.sellerLoginCheck,name='sellerLoginCheck'),
    path('sellerHome',sv.sellerHome,name='sellerHome'),
    path('addVehicle',sv.addVehicle,name='addVehicle'),
    path('vehicleHistory',sv.vehicleHistory,name='vehicleHistory'),
    
    

    
    

    path('log',av.log,name='log'),

    # API Endpoints
    path('api/login', api.api_login, name='api_login'),
    path('api/register', api.api_register, name='api_register'),
    path('api/browse-vehicles', api.api_browse_vehicles, name='api_browse_vehicles'),
    path('api/purchase-vehicle', api.api_purchase_vehicle, name='api_purchase_vehicle'),
    # Admin Management APIs
    path('api/admin/buyers', api.api_admin_buyers, name='api_admin_buyers'),
    path('api/admin/sellers', api.api_admin_sellers, name='api_admin_sellers'),
    path('api/admin/activate-buyer', api.api_admin_activate_buyer, name='api_admin_activate_buyer'),
    path('api/admin/activate-seller', api.api_admin_activate_seller, name='api_admin_activate_seller'),
    path('api/admin/transactions', api.api_admin_transactions, name='api_admin_transactions'),
    path('api/admin/approve-transaction', api.api_admin_approve_transaction, name='api_admin_approve_transaction'),
    # Seller APIs
    path('api/seller/add-vehicle', api.api_add_vehicle, name='api_add_vehicle'),
    path('api/seller/vehicle-history', api.api_vehicle_history, name='api_vehicle_history'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
