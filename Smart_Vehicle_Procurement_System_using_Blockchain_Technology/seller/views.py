from django.shortcuts import render
from django.core.exceptions import ValidationError

from Buyers.models import Vehicle1
from seller.models import Vehicle, sellerRegisteredTable
from django.contrib import messages
# Create your views here.
def sellerHome(request):
    if not request.session.get('id'):
        return render(request,'sellerLoginForm.html')
    return render(request,'seller/sellerHome.html')

def sellerRegisterCheck(request):
    if request.method=="POST":
        name=request.POST['name']
        email=request.POST['email']
        loginid=request.POST['loginid']
        mobile=request.POST['mobile']
        password=request.POST['password']


        user = sellerRegisteredTable(
            name=name,
            email=email,
            loginid=loginid,
            mobile=mobile,
            password=password,
            
        )

        try:
            # Validate using model field validators
            user.full_clean()
            
            # Save to DB
            user.save()
            messages.success(request,'registration Successfully done,please wait for admin APPROVAL')
            return render(request, "sellerRegisterForm.html")


        except ValidationError as ve:
            # Get a list of error messages to display
            error_messages = []
            for field, errors in ve.message_dict.items():
                for error in errors:
                    error_messages.append(f"{field.capitalize()}: {error}")
            return render(request, "sellerRegisterForm.html", {"messages": error_messages})

        except Exception as e:
            # Handle other exceptions (like unique constraint fails)
            return render(request, "sellerRegisterForm.html", {"messages": [str(e)]})

    return render(request, "sellerRegisterForm.html")


def sellerLoginCheck(request):
    if request.method=='POST':
        username=request.POST['loginid']
        password=request.POST['password']

        try:
            user=sellerRegisteredTable.objects.get(loginid=username,password=password)

            if user.status=='Active':
                request.session['id']=user.id
                request.session['name']=user.name
                request.session['email']=user.email
                
                return render(request,'seller/sellerHome.html')
            else:
                messages.error(request,'Status not activated please wait for admin approval')
                return render(request,'sellerLoginForm.html')
        except:
            messages.error(request,'Invalid details please enter details carefully or Please Register')
            return render(request,'sellerLoginForm.html')
    return render(request,'sellerLoginForm.html')

import hashlib
import json
import time
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_protect
from django.core.files.storage import FileSystemStorage
from django.contrib import messages

# Simple Blockchain Implementation
class Block:
    def __init__(self, index, transactions, timestamp, previous_hash):
        self.index = index
        self.transactions = transactions
        self.timestamp = timestamp
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.compute_hash()

    def compute_hash(self):
        block_string = json.dumps({
            'index': self.index,
            'transactions': self.transactions,
            'timestamp': self.timestamp,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

class Blockchain:
    def __init__(self):
        self.chain = []
        self.difficulty = 4  # Proof-of-work difficulty
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis_block = Block(0, [], time.time(), "0")
        self.proof_of_work(genesis_block)
        self.chain.append(genesis_block)

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, block):
        block.previous_hash = self.get_latest_block().hash
        self.proof_of_work(block)
        self.chain.append(block)

    def proof_of_work(self, block):
        while True:
            block.hash = block.compute_hash()
            if block.hash[:self.difficulty] == "0" * self.difficulty:
                break
            block.nonce += 1

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            if current.hash != current.compute_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
        return True

# Initialize Blockchain
vehicle_blockchain = Blockchain()

@csrf_protect
def addVehicle(request):
    if not request.session.get('id'):
        return render(request,'sellerLoginForm.html')
    
    if request.method == 'POST':
        # Extract form data
        vehicle_number = request.POST.get('vehicle_number')
        accidents_history = request.POST.get('accidents_history', '')
        price = request.POST.get('price')

        # Handle file uploads
        picture = request.FILES.get('picture')
        ownership_documents = request.FILES.get('ownership_documents')

        # Validate required fields
        if not vehicle_number or not price:
            messages.error(request, "Vehicle Number and Price are required.")
            return redirect('addVehicle')

        # Vehicle number format validation (e.g., AP34DH5001)
        import re
        pattern = r'^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$'
        if not re.match(pattern, vehicle_number):
            messages.error(request, "Invalid Vehicle Number format. Expected format: AP34DH5001")
            return redirect('addVehicle')

        # Save files to storage
        fs = FileSystemStorage()
        picture_path = None
        documents_path = None
        if picture:
            picture_path = fs.save(f'vehicles/pictures/{picture.name}', picture)
        if ownership_documents:
            documents_path = fs.save(f'vehicles/documents/{ownership_documents.name}', ownership_documents)

        # Create transaction data
        transaction = {
            'seller_id': request.session.get('name') ,# Assumes user is authenticated
            'vehicle_number': vehicle_number,
            'picture_path': picture_path,
            'accidents_history': accidents_history,
            'ownership_documents_path': documents_path,
            'price': float(price),
            'timestamp': time.time()
        }

        # Create new block with transaction
        block = Block(
            index=len(vehicle_blockchain.chain),
            transactions=[transaction],
            timestamp=time.time(),
            previous_hash=vehicle_blockchain.get_latest_block().hash
        )
       
        vehicle = Vehicle.objects.create(
            vehicle_number=vehicle_number,
            picture=picture_path,
            accidents_history=accidents_history,
            ownership_documents=documents_path,
            price=price,
            block_hash=block.hash
        )
        vehicle1= Vehicle1.objects.create(

            vehicle_number=vehicle_number,
            picture=picture_path,
            accidents_history=accidents_history,
            ownership_documents=documents_path,
            price=price,
            block_hash=block.hash
        )

        # Add block to blockchain
        vehicle_blockchain.add_block(block)

        messages.success(request, "Vehicle added successfully to the blockchain!")
        return render(request,'seller/addVehicle.html')

    return render(request,'seller/addVehicle.html')

def vehicleHistory(request):
    if not request.session.get('id'):
        return render(request,'sellerLoginForm.html')
    

    Vehicles=Vehicle.objects.all()

    return render(request,'seller/vehicleHistory.html',{'vehicles':Vehicles})
